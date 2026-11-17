import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  REJECT_FACTOR,
  applyRejections,
  exportRecords,
  pickGuess,
  summarize,
  wilson,
  type GuessRecord,
} from "./guess";

const beliefArb = fc
  .array(fc.double({ min: 0.001, max: 1, noNaN: true }), { minLength: 2, maxLength: 12 })
  .map((xs) => {
    const s = xs.reduce((a, b) => a + b, 0);
    return xs.map((x) => x / s);
  });
const rejectedArb = (n: number) => fc.uniqueArray(fc.integer({ min: 0, max: n - 1 }), { maxLength: 2 });

describe("applyRejections", () => {
  it("returns a distribution", () => {
    fc.assert(
      fc.property(beliefArb.chain((b) => fc.tuple(fc.constant(b), rejectedArb(b.length))), ([b, r]) => {
        const out = applyRejections(b, r);
        expect(out.reduce((a, c) => a + c, 0)).toBeCloseTo(1, 9);
        out.forEach((p) => expect(p).toBeGreaterThanOrEqual(0));
      }),
    );
  });

  it("lowers rejected needs and never sets them to zero", () => {
    fc.assert(
      fc.property(
        beliefArb.chain((b) => fc.tuple(fc.constant(b), rejectedArb(b.length).filter((r) => r.length > 0 && r.length < b.length))),
        ([b, r]) => {
          const out = applyRejections(b, r);
          for (const i of r) {
            expect(out[i]).toBeLessThan(b[i]);
            expect(out[i]).toBeGreaterThan(0);
          }
        },
      ),
    );
  });

  it("keeps ratios among needs that were not rejected", () => {
    fc.assert(
      fc.property(
        beliefArb.chain((b) => fc.tuple(fc.constant(b), rejectedArb(b.length))),
        ([b, r]) => {
          const keep = b.map((_, i) => i).filter((i) => !r.includes(i));
          if (keep.length < 2) return;
          const out = applyRejections(b, r);
          expect(out[keep[0]] / out[keep[1]]).toBeCloseTo(b[keep[0]] / b[keep[1]], 6);
        },
      ),
    );
  });

  it("is the identity when nothing is rejected", () => {
    const b = [0.5, 0.3, 0.2];
    applyRejections(b, []).forEach((p, i) => expect(p).toBeCloseTo(b[i], 12));
  });

  it("uses the stated factor", () => {
    const out = applyRejections([0.5, 0.5], [0]);
    expect(out[0] / out[1]).toBeCloseTo(REJECT_FACTOR, 12);
  });
});

describe("pickGuess", () => {
  it("never returns a rejected need and returns the best remaining one", () => {
    fc.assert(
      fc.property(beliefArb.chain((b) => fc.tuple(fc.constant(b), rejectedArb(b.length).filter((r) => r.length < b.length))), ([b, r]) => {
        const g = pickGuess(b, r);
        expect(g).not.toBeNull();
        expect(r).not.toContain(g!.index);
        b.forEach((p, i) => {
          if (!r.includes(i)) expect(p).toBeLessThanOrEqual(g!.probability);
        });
      }),
    );
  });

  it("returns null when every need is rejected", () => {
    expect(pickGuess([0.6, 0.4], [0, 1])).toBeNull();
  });
});

describe("wilson", () => {
  it("stays inside [0, 1] and contains the observed rate", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 200 }).chain((n) => fc.tuple(fc.integer({ min: 0, max: n }), fc.constant(n))), ([k, n]) => {
        const [lo, hi] = wilson(k, n);
        expect(lo).toBeGreaterThanOrEqual(0);
        expect(hi).toBeLessThanOrEqual(1);
        expect(lo).toBeLessThanOrEqual(k / n + 1e-12);
        expect(hi).toBeGreaterThanOrEqual(k / n - 1e-12);
      }),
    );
  });

  it("is wide with few rounds and says nothing with none", () => {
    expect(wilson(0, 0)).toEqual([0, 1]);
    const [lo, hi] = wilson(3, 3);
    expect(hi - lo).toBeGreaterThan(0.3);
  });

  it("narrows as evidence grows at the same rate", () => {
    const a = wilson(5, 10);
    const b = wilson(50, 100);
    expect(b[1] - b[0]).toBeLessThan(a[1] - a[0]);
  });
});

describe("summarize and export", () => {
  const rec = (verdict: GuessRecord["verdict"], p = 0.6): GuessRecord => ({
    pack: "devstuck",
    answers: 5,
    guesses: [{ need: "a", probability: p }],
    verdict,
    actual: verdict === "wrong" ? "b" : null,
  });

  it("counts add up and unsure rounds stay out of the rate", () => {
    const s = summarize([rec("right"), rec("right"), rec("wrong"), rec("unsure")]);
    expect(s.rounds).toBe(4);
    expect(s.right + s.wrong + s.unsure).toBe(4);
    expect(s.rate).toBeCloseTo(2 / 3, 12);
  });

  it("has no rate before any decided round", () => {
    const s = summarize([rec("unsure")]);
    expect(s.rate).toBeNull();
    expect(s.meanFirstProbability).toBeNull();
    expect(s.interval).toEqual([0, 1]);
  });

  it("exports JSON with a schema and no free-text field", () => {
    const j = JSON.parse(exportRecords([rec("right")]));
    expect(j.schema).toMatch(/^atamagazon-guess-records\//);
    expect(Object.keys(j.records[0]).sort()).toEqual(["actual", "answers", "guesses", "pack", "verdict"]);
  });
});
