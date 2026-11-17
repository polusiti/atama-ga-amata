import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { kb } from "../data/kb";
import {
  answerDistribution,
  chooseNextQuestion,
  DEFAULT_STOP,
  expectedInformationGain,
  fitChanges,
  priorFromStated,
  rankSolutions,
  replayBelief,
  shouldStop,
  statedGap,
  updateBelief,
} from "./engine";
import { entropy, normalize, sum, uniform } from "./math";
import { ANSWERS, DEFAULT_PARAMS, type Answer } from "./types";

const N = kb.needs.length;
const belief = () =>
  fc
    .array(fc.double({ min: 0.001, max: 1, noNaN: true }), { minLength: N, maxLength: N })
    .map((xs) => normalize(xs));
const answer = () => fc.constantFrom<Answer>(...ANSWERS);
const question = () => fc.constantFrom(...kb.questions);

describe("answerDistribution", () => {
  it("is a probability distribution for any attribute strength", () => {
    fc.assert(
      fc.property(fc.double({ min: 0, max: 1, noNaN: true }), (v) => {
        const d = answerDistribution(v);
        expect(sum(d)).toBeCloseTo(1, 10);
        expect(d.every((x) => x >= 0)).toBe(true);
      }),
    );
  });

  it("gives \"unknown\" the same probability whatever the truth is", () => {
    const u = ANSWERS.indexOf("unknown");
    // The "don't know" share, mixed with the lapse rate (uniform over five answers).
    const expected = (1 - DEFAULT_PARAMS.lapse) * DEFAULT_PARAMS.unknown + DEFAULT_PARAMS.lapse / ANSWERS.length;
    expect(answerDistribution(0)[u]).toBeCloseTo(expected, 12);
    expect(answerDistribution(1)[u]).toBeCloseTo(expected, 12);
    expect(answerDistribution(0.4)[u]).toBeCloseTo(expected, 12);
  });
});

describe("lapse rate (bounded evidence)", () => {
  it("keeps every answer probability at least lapse / 5, so no answer can move the odds by more than 5 / lapse", () => {
    const floor = DEFAULT_PARAMS.lapse / ANSWERS.length;
    const bound = 1 / floor;
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 1, noNaN: true }),
        fc.double({ min: 0, max: 1, noNaN: true }),
        (v1, v2) => {
          const a = answerDistribution(v1);
          const b = answerDistribution(v2);
          a.forEach((p, i) => {
            expect(p).toBeGreaterThanOrEqual(floor - 1e-12);
            expect(p / b[i]).toBeLessThanOrEqual(bound + 1e-9);
          });
        },
      ),
    );
  });

  it("makes two agreeable answers unable to give near certainty", () => {
    let b = uniform(N);
    for (const qid of ["q-recall-money", "q-weekly"]) {
      const q = kb.questions.find((x) => x.id === qid)!;
      b = updateBelief(b, kb, q, "yes");
    }
    expect(Math.max(...b)).toBeLessThan(0.95);
  });
});

describe("stop rule minimum", () => {
  it("never declares confidence before the minimum number of answers", () => {
    const sharp = new Array(N).fill(0.001);
    sharp[0] = 1 - 0.001 * (N - 1);
    for (let asked = 0; asked < DEFAULT_STOP.minQuestions; asked++) {
      const ids = kb.questions.slice(0, asked).map((q) => q.id);
      expect(shouldStop(sharp, kb, ids)).not.toBe("confident");
    }
    const enough = kb.questions.slice(0, DEFAULT_STOP.minQuestions).map((q) => q.id);
    expect(shouldStop(sharp, kb, enough)).toBe("confident");
  });
});

describe("updateBelief", () => {
  it("returns a distribution", () => {
    fc.assert(
      fc.property(belief(), question(), answer(), (b, q, a) => {
        const next = updateBelief(b, kb, q, a);
        expect(sum(next)).toBeCloseTo(1, 10);
        expect(next.every((x) => x >= 0)).toBe(true);
      }),
    );
  });

  it("leaves the belief unchanged when the user does not know", () => {
    fc.assert(
      fc.property(belief(), question(), (b, q) => {
        const next = updateBelief(b, kb, q, "unknown");
        next.forEach((x, i) => expect(x).toBeCloseTo(b[i], 10));
      }),
    );
  });
});

describe("expectedInformationGain", () => {
  it("is non-negative and at most ln(5)", () => {
    fc.assert(
      fc.property(belief(), question(), (b, q) => {
        const g = expectedInformationGain(b, kb, q);
        expect(g).toBeGreaterThanOrEqual(0);
        expect(g).toBeLessThanOrEqual(Math.log(ANSWERS.length) + 1e-9);
      }),
    );
  });

  it("equals the prior entropy minus the expected posterior entropy", () => {
    fc.assert(
      fc.property(belief(), question(), (b, q) => {
        let expectedPosteriorH = 0;
        ANSWERS.forEach((a, ai) => {
          const pa = kb.needs.reduce(
            (acc, need, i) => acc + b[i] * answerDistribution(q.yes[need.id] ?? q.base)[ai],
            0,
          );
          if (pa > 0) expectedPosteriorH += pa * entropy(updateBelief(b, kb, q, a));
        });
        expect(expectedInformationGain(b, kb, q)).toBeCloseTo(entropy(b) - expectedPosteriorH, 8);
      }),
    );
  });

  it("is zero for a question that treats every need the same", () => {
    const flat = { ...kb.questions[0], yes: {}, base: 0.5 };
    expect(expectedInformationGain(uniform(N), kb, flat)).toBeCloseTo(0, 12);
  });
});

describe("chooseNextQuestion", () => {
  it("never repeats an asked question and returns null when none are left", () => {
    const all = kb.questions.map((q) => q.id);
    expect(chooseNextQuestion(uniform(N), kb, all)).toBeNull();
    const next = chooseNextQuestion(uniform(N), kb, all.slice(1));
    expect(next?.question.id).toBe(all[0]);
  });
});

describe("priorFromStated", () => {
  it("is uniform without a stated solution and shifts toward the needs it fits", () => {
    expect(priorFromStated(kb, null)).toEqual(uniform(N));
    const p = priorFromStated(kb, "add-cache");
    const idx = kb.needs.findIndex((n) => n.id === "slow-unknown");
    expect(p[idx]).toBe(Math.max(...p));
    expect(sum(p)).toBeCloseTo(1, 10);
  });
});

describe("end to end with a noiseless user", () => {
  /** The answer a user would give if their need were `needId`, with no noise. */
  function idealAnswer(needId: string, qid: string): Answer {
    const q = kb.questions.find((x) => x.id === qid)!;
    const v = q.yes[needId] ?? q.base;
    if (v >= 0.875) return "yes";
    if (v >= 0.5) return "probably";
    if (v >= 0.125) return "probablyNot";
    return "no";
  }

  for (const need of kb.needs) {
    it(`finds the need "${need.id}" within the question budget`, () => {
      let b = uniform(N);
      const asked: string[] = [];
      while (shouldStop(b, kb, asked) === null) {
        const next = chooseNextQuestion(b, kb, asked)!;
        b = updateBelief(b, kb, next.question, idealAnswer(need.id, next.question.id));
        asked.push(next.question.id);
      }
      const top = b.indexOf(Math.max(...b));
      expect(kb.needs[top].id).toBe(need.id);
      expect(asked.length).toBeLessThanOrEqual(8);
    });
  }
});

describe("replayBelief", () => {
  const entryArb = fc.record({
    qid: fc.constantFrom(...kb.questions.map((q) => q.id)),
    answer: answer(),
  });

  it("equals sequential updates, and any prefix gives the earlier belief (exact undo)", () => {
    fc.assert(
      fc.property(
        fc.array(entryArb, { maxLength: 8 }),
        fc.option(fc.constantFrom(...kb.solutions.map((s) => s.id)), { nil: null }),
        (entries, stated) => {
          let sequential = priorFromStated(kb, stated);
          const beliefs = [sequential];
          for (const e of entries) {
            const q = kb.questions.find((x) => x.id === e.qid)!;
            sequential = updateBelief(sequential, kb, q, e.answer);
            beliefs.push(sequential);
          }
          entries.forEach((_, k) => {
            const prefix = replayBelief(kb, stated, entries.slice(0, k));
            prefix.forEach((x, i) => expect(x).toBeCloseTo(beliefs[k][i], 12));
          });
          const full = replayBelief(kb, stated, entries);
          full.forEach((x, i) => expect(x).toBeCloseTo(sequential[i], 12));
          expect(sum(full)).toBeCloseTo(1, 10);
        },
      ),
    );
  });
});

describe("fitChanges", () => {
  it("reports after - before, largest absolute change first, for every solution", () => {
    fc.assert(
      fc.property(belief(), belief(), (a, b) => {
        const changes = fitChanges(kb, a, b);
        expect(changes).toHaveLength(kb.solutions.length);
        changes.forEach((c) => expect(c.delta).toBeCloseTo(c.after - c.before, 12));
        for (let i = 1; i < changes.length; i++) {
          expect(Math.abs(changes[i - 1].delta)).toBeGreaterThanOrEqual(Math.abs(changes[i].delta) - 1e-12);
        }
      }),
    );
  });

  it("is all zeros when nothing changed", () => {
    const b = uniform(N);
    fitChanges(kb, b, b).forEach((c) => expect(c.delta).toBeCloseTo(0, 12));
  });
});

describe("solution fixation (the XY problem)", () => {
  it("shows a large gap when the stated solution does not fit the inferred need", () => {
    // User says "add a cache" but every answer points to a team-alignment need.
    const prior = priorFromStated(kb, "add-cache");
    let b = prior;
    for (const qid of ["q-misread", "q-many-people", "q-measured"]) {
      const q = kb.questions.find((x) => x.id === qid)!;
      b = updateBelief(b, kb, q, qid === "q-measured" ? "probablyNot" : "yes");
    }
    const gap = statedGap(kb, "add-cache", b)!;
    expect(gap).toBeGreaterThan(0.8);
    expect(rankSolutions(b, kb)[0].solution.id).toBe("shared-spec");
  });
});


