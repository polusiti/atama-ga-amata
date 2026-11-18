import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_ITEM_BUDGET,
  GRID,
  MIN_ITEMS,
  bandOf,
  coverage,
  expectedGain,
  fitCheck,
  fitProbability,
  interval,
  nextItem,
  pCorrect,
  posterior,
  priorPosterior,
  type Item,
  type Response,
} from "./fit";

const bank: Item[] = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5].map((b, i) => ({ id: `i${i}`, b }));
const respArb = fc.array(fc.record({ itemId: fc.constantFrom(...bank.map((b) => b.id)), correct: fc.boolean() }), { maxLength: 8 });
const uniq = (rs: Response[]) => rs.filter((r, i) => rs.findIndex((x) => x.itemId === r.itemId) === i);

describe("fit: the posterior", () => {
  it("is a distribution", () => {
    fc.assert(
      fc.property(respArb, (rs) => {
        const post = posterior(bank, uniq(rs));
        expect(post.reduce((a, x) => a + x, 0)).toBeCloseTo(1, 9);
        post.forEach((x) => expect(x).toBeGreaterThanOrEqual(0));
        expect(post).toHaveLength(GRID.length);
      }),
    );
  });

  it("does not depend on the order of the answers", () => {
    fc.assert(
      fc.property(respArb, (rs) => {
        const a = uniq(rs);
        const b = [...a].reverse();
        const pa = posterior(bank, a);
        const pb = posterior(bank, b);
        pa.forEach((x, i) => expect(x).toBeCloseTo(pb[i], 10));
      }),
    );
  });

  it("a correct answer never lowers P(theta >= R) and a wrong one never raises it", () => {
    fc.assert(
      fc.property(respArb, fc.constantFrom(...bank.map((b) => b.id)), fc.double({ min: -2, max: 2, noNaN: true }), (rs, id, R) => {
        const base = uniq(rs).filter((r) => r.itemId !== id);
        const p0 = fitProbability(posterior(bank, base), R);
        const pRight = fitProbability(posterior(bank, [...base, { itemId: id, correct: true }]), R);
        const pWrong = fitProbability(posterior(bank, [...base, { itemId: id, correct: false }]), R);
        expect(pRight).toBeGreaterThanOrEqual(p0 - 1e-9);
        expect(pWrong).toBeLessThanOrEqual(p0 + 1e-9);
      }),
    );
  });

  it("all correct on hard items puts the person above all wrong on easy items", () => {
    const good = posterior(bank, bank.slice(4).map((it) => ({ itemId: it.id, correct: true })));
    const poor = posterior(bank, bank.slice(0, 5).map((it) => ({ itemId: it.id, correct: false })));
    const mean = (p: number[]) => p.reduce((a, x, k) => a + x * GRID[k], 0);
    expect(mean(good)).toBeGreaterThan(mean(poor) + 1);
  });

  it("rejects an unknown item", () => {
    expect(() => posterior(bank, [{ itemId: "nope", correct: true }])).toThrow();
  });
});

describe("fit: guessing floor", () => {
  it("never gives less than the guessing floor and approaches 1 for strong ability", () => {
    expect(pCorrect(-3, 3)).toBeGreaterThanOrEqual(0.25);
    expect(pCorrect(3, -3)).toBeGreaterThan(0.99);
  });

  it("one lucky right answer on a hard item moves the estimate less than on an easy item would suggest", () => {
    const hard = fitProbability(posterior(bank, [{ itemId: "i9", correct: true }]), 1);
    const easy = fitProbability(posterior(bank, [{ itemId: "i0", correct: true }]), 1);
    expect(hard).toBeGreaterThan(easy);
  });
});

describe("fit: bands and the rule of no reference", () => {
  it("bandOf follows the 80% and 20% marks", () => {
    expect(bandOf(0.8)).toBe("fit");
    expect(bandOf(0.79)).toBe("stretch");
    expect(bandOf(0.2)).toBe("mismatch");
    expect(bandOf(0.21)).toBe("stretch");
  });

  it("gives no band without a source", () => {
    const post = priorPosterior();
    expect(fitCheck(post, { level: 1 }).kind).toBe("no-reference");
    expect(fitCheck(post, { level: 1, source: "   " }).kind).toBe("no-reference");
    const r = fitCheck(post, { level: 1, source: "authored: rule of thumb, not tested" });
    expect(r.kind).toBe("band");
  });

  it("cannot measure a level that the items do not reach on both sides (a measure is no better than its items)", () => {
    const post = priorPosterior();
    // The bank tops out at 2.5, so a level of 2 has only one clearly harder item.
    const r = fitCheck(post, { level: 2, source: "x" }, bank);
    expect(r.kind).toBe("cannot-measure");
    // A level with enough items on both sides is measured.
    expect(fitCheck(post, { level: 0, source: "x" }, bank).kind).toBe("band");
  });

  it("coverage counts the items clearly easier and clearly harder", () => {
    // b = -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5. At level 0: easier by 1 or more = {-2, -1.5, -1}; harder by 1 or more = {1, 1.5, 2, 2.5}.
    expect(coverage(bank, 0)).toEqual({ easier: 3, harder: 4, covered: true });
    expect(coverage(bank, 2).covered).toBe(false);
    expect(coverage([], 0).covered).toBe(false);
  });

  it("with the sources check first: no source still wins over coverage", () => {
    expect(fitCheck(priorPosterior(), { level: 2 }, bank).kind).toBe("no-reference");
  });

  it("a person who failed the easy items does not fit a high requirement", () => {
    const post = posterior(bank, bank.slice(0, 5).map((it) => ({ itemId: it.id, correct: false })));
    const r = fitCheck(post, { level: 2, source: "x" });
    expect(r.kind === "band" && r.band).toBe("mismatch");
  });

  it("the interval is ordered and inside the grid", () => {
    fc.assert(
      fc.property(respArb, (rs) => {
        const [a, b] = interval(posterior(bank, uniq(rs)));
        expect(a).toBeLessThanOrEqual(b);
        expect(a).toBeGreaterThanOrEqual(GRID[0]);
        expect(b).toBeLessThanOrEqual(GRID[GRID.length - 1]);
      }),
    );
  });
});

describe("fit: choosing the next item and stopping", () => {
  it("asks an item near the requirement first", () => {
    const r = nextItem(bank, [], 0.5);
    expect(r.stop).toBeNull();
    if (r.stop === null) expect(Math.abs(r.item.b - 0.5)).toBeLessThanOrEqual(1);
  });

  it("expected gain is never negative", () => {
    fc.assert(
      fc.property(respArb, fc.double({ min: -2, max: 2, noNaN: true }), (rs, R) => {
        const post = posterior(bank, uniq(rs));
        for (const it of bank) expect(expectedGain(post, it, R)).toBeGreaterThanOrEqual(-1e-9);
      }),
    );
  });

  it("never asks an item twice and stops within the budget", () => {
    fc.assert(
      fc.property(fc.double({ min: -2, max: 2, noNaN: true }), fc.array(fc.boolean(), { minLength: 20, maxLength: 20 }), (R, truth) => {
        const rs: Response[] = [];
        for (let n = 0; n < 20; n++) {
          const r = nextItem(bank, rs, R);
          if (r.stop !== null) {
            expect(rs.length).toBeLessThanOrEqual(DEFAULT_ITEM_BUDGET);
            return;
          }
          expect(rs.some((x) => x.itemId === r.item.id)).toBe(false);
          rs.push({ itemId: r.item.id, correct: truth[n] });
        }
        throw new Error("did not stop");
      }),
    );
  });

  it("never stops before the minimum number of answers, whatever the requirement is (no judgement before the person answers)", () => {
    fc.assert(
      fc.property(fc.double({ min: -3, max: 3, noNaN: true }), fc.integer({ min: 0, max: MIN_ITEMS - 1 }), (R, n) => {
        const rs: Response[] = bank.slice(0, n).map((it) => ({ itemId: it.id, correct: false }));
        const r = nextItem(bank, rs, R, 20);
        expect(r.stop).toBeNull();
      }),
    );
  });

  it("a far-away requirement still gets questions first (regression: it used to stop after 0 items)", () => {
    expect(nextItem(bank, [], 2.0).stop).toBeNull();
    expect(nextItem(bank, [], -2.5).stop).toBeNull();
  });

  it("stops as sure-above when a strong person has answered hard items correctly", () => {
    const rs: Response[] = bank.slice(5).map((it) => ({ itemId: it.id, correct: true }));
    const r = nextItem(bank, rs, -0.5, 20);
    expect(r.stop).toBe("sure-above");
  });

  it("stops as sure-below when a weak person has missed easy items", () => {
    const rs: Response[] = bank.slice(0, 5).map((it) => ({ itemId: it.id, correct: false }));
    const r = nextItem(bank, rs, 1.5, 20);
    expect(r.stop).toBe("sure-below");
  });
});
