import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { kb } from "../data/kb";
import { asksWhy, decide, render, type Lookup } from "./dialogue";
import { priorFromStated, replayBelief } from "./engine";
import { contributions, explainWhy, traceBelief } from "./explain";
import { entropy, normalize, sum } from "./math";
import { ANSWERS } from "./types";

const N = kb.needs.length;
const belief = () =>
  fc
    .array(fc.double({ min: 0.001, max: 1, noNaN: true }), { minLength: N, maxLength: N })
    .map((xs) => normalize(xs));
const entryArb = fc.record({
  qid: fc.constantFrom(...kb.questions.map((q) => q.id)),
  answer: fc.constantFrom(...ANSWERS),
});
const noteArb = fc.array(
  fc.array(fc.double({ min: 1, max: 4.2, noNaN: true }), { minLength: N, maxLength: N }),
  { maxLength: 3 },
);
const statedArb = fc.option(fc.constantFrom(...kb.solutions.map((s) => s.id)), { nil: null });

describe("explainWhy", () => {
  it("lists answer probabilities that sum to 1", () => {
    fc.assert(
      fc.property(belief(), fc.constantFrom(...kb.questions), (b, q) => {
        const why = explainWhy(kb, b, q);
        expect(why.outcomes).toHaveLength(ANSWERS.length);
        expect(sum(why.outcomes.map((o) => o.probability))).toBeCloseTo(1, 10);
        why.outcomes.forEach((o) => {
          expect(o.topProbability).toBeGreaterThan(0);
          expect(o.topProbability).toBeLessThanOrEqual(1 + 1e-12);
        });
      }),
    );
  });

  it("matches the information gain: prior entropy minus expected posterior entropy", () => {
    fc.assert(
      fc.property(belief(), fc.constantFrom(...kb.questions), (b, q) => {
        const why = explainWhy(kb, b, q);
        // Rebuild each posterior through the same public path the UI uses.
        const expectedPosteriorH = why.outcomes.reduce((acc, o) => {
          const entries = [{ qid: q.id, answer: o.answer }];
          const post = replayBeliefFrom(b, entries);
          return acc + o.probability * entropy(post);
        }, 0);
        expect(why.gain).toBeCloseTo(entropy(b) - expectedPosteriorH, 8);
      }),
    );
  });

  it("names up to three leaders, best first", () => {
    fc.assert(
      fc.property(belief(), fc.constantFrom(...kb.questions), (b, q) => {
        const { leaders } = explainWhy(kb, b, q);
        expect(leaders.length).toBeLessThanOrEqual(3);
        for (let i = 1; i < leaders.length; i++) {
          expect(leaders[i - 1].probability).toBeGreaterThanOrEqual(leaders[i].probability);
        }
      }),
    );
  });
});

/** Apply answers to an arbitrary starting belief using the engine's own update. */
function replayBeliefFrom(start: readonly number[], entries: { qid: string; answer: (typeof ANSWERS)[number] }[]) {
  // replayBelief starts from the prior, so use a note vector equal to start * N to land on `start` first.
  const note = start.map((x) => x * N);
  return replayBelief(kb, null, entries, undefined, [note]);
}

describe("traceBelief and contributions (HOW)", () => {
  it("ends at exactly the belief that replayBelief computes", () => {
    fc.assert(
      fc.property(statedArb, fc.array(entryArb, { maxLength: 6 }), noteArb, (stated, entries, notes) => {
        const trace = traceBelief(kb, stated, entries, undefined, notes);
        const direct = replayBelief(kb, stated, entries, undefined, notes);
        const last = trace.steps.length > 0 ? trace.steps[trace.steps.length - 1].after : trace.start;
        last.forEach((x, i) => expect(x).toBeCloseTo(direct[i], 10));
      }),
    );
  });

  it("has factors whose product is final / start for every need", () => {
    fc.assert(
      fc.property(statedArb, fc.array(entryArb, { maxLength: 6 }), noteArb, (stated, entries, notes) => {
        const trace = traceBelief(kb, stated, entries, undefined, notes);
        const direct = replayBelief(kb, stated, entries, undefined, notes);
        kb.needs.forEach((_, i) => {
          const product = contributions(trace, i).reduce((acc, c) => acc * c.factor, 1);
          expect(product).toBeCloseTo(direct[i] / trace.start[i], 8);
        });
      }),
    );
  });

  it("adds a stated step only when a solution is named", () => {
    expect(traceBelief(kb, null, []).steps).toHaveLength(0);
    const t = traceBelief(kb, "add-cache", []);
    expect(t.steps.map((s) => s.kind)).toEqual(["stated"]);
    t.steps[0].after.forEach((x, i) => expect(x).toBeCloseTo(priorFromStated(kb, "add-cache")[i], 12));
  });
});

describe("asking why in the shopkeeper window", () => {
  const lookup: Lookup = {
    need: (id, lang) => kb.needs.find((n) => n.id === id)!.short[lang],
    solution: (id, lang) => kb.solutions.find((s) => s.id === id)!.title[lang],
  };

  it("recognizes why-questions in Japanese and English and nothing else", () => {
    for (const s of ["なぜ？", "どうして聞くの", "Why?", "why do you ask", "なんで"]) expect(asksWhy(s), s).toBe(true);
    for (const s of ["お金が消える", "I forgot why", "キャッシュを追加したい", ""]) expect(asksWhy(s), s).toBe(false);
  });

  it("names the two leading needs, or says no question is pending", () => {
    const some = decide({ event: "why", history: [], needIds: ["spend-blind", "forget-deadline"] });
    expect(some.kind).toBe("why");
    const text = render(some, "ja", lookup);
    expect(text).toContain("お金");
    expect(text).toContain("期限");
    expect(text).not.toMatch(/\{|\}/);
    expect(decide({ event: "why", history: [], needIds: null }).kind).toBe("whyNone");
    expect(decide({ event: "why", history: [], needIds: ["spend-blind"] }).kind).toBe("whyNone");
  });
});
