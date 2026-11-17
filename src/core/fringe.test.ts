import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { devstuck as kb } from "../data/devstuck";
import { establishedSteps, hasCycle, stepStates } from "./fringe";
import { ANSWERS } from "./types";

const ids = kb.solutions.map((s) => s.id);
const subset = fc.subarray(ids).map((a) => new Set(a));

describe("stepStates", () => {
  it("gives every step exactly one status", () => {
    fc.assert(
      fc.property(subset, (est) => {
        const states = stepStates(kb, est);
        expect(states.size).toBe(ids.length);
        for (const s of states.values()) expect(["done", "blocked", "next"]).toContain(s.status);
      }),
    );
  });

  it("marks a step done exactly when it is established", () => {
    fc.assert(
      fc.property(subset, (est) => {
        for (const s of stepStates(kb, est).values()) expect(s.status === "done").toBe(est.has(s.solutionId));
      }),
    );
  });

  it("makes a step next only when all its prerequisites are in place, and blocked otherwise", () => {
    fc.assert(
      fc.property(subset, (est) => {
        for (const sol of kb.solutions) {
          const st = stepStates(kb, est).get(sol.id)!;
          const unmet = (sol.requires ?? []).filter((r) => !est.has(r));
          if (st.status === "next") expect(unmet).toHaveLength(0);
          if (st.status === "blocked") {
            expect(unmet.length).toBeGreaterThan(0);
            expect(st.blockedBy).toEqual(unmet);
          }
        }
      }),
    );
  });

  it("is monotone: establishing more never un-does a step", () => {
    fc.assert(
      fc.property(subset, fc.constantFrom(...ids), (est, extra) => {
        const more = new Set([...est, extra]);
        const before = stepStates(kb, est);
        const after = stepStates(kb, more);
        for (const [id, s] of before) {
          if (s.status === "done") expect(after.get(id)!.status).toBe("done");
          if (s.status === "next") expect(after.get(id)!.status).not.toBe("blocked");
        }
      }),
    );
  });

  it("always has a first move: with nothing in place some step is next", () => {
    const states = [...stepStates(kb, new Set()).values()];
    expect(states.some((s) => s.status === "next")).toBe(true);
  });

  it("is acyclic", () => {
    expect(hasCycle(kb)).toBe(false);
  });

  it("detects a cycle when one is introduced", () => {
    const bad = {
      ...kb,
      solutions: kb.solutions.map((s) => (s.id === "fix-repro" ? { ...s, requires: ["make-minimal"] } : s)),
    };
    expect(hasCycle(bad)).toBe(true);
  });
});

describe("establishedSteps", () => {
  const practiceProbe = kb.questions.find((q) => q.practice)!;
  const signalProbe = kb.questions.find((q) => !q.practice)!;

  it("counts a probe only when answered yes or probably", () => {
    for (const answer of ANSWERS) {
      const est = establishedSteps(kb, [{ qid: practiceProbe.id, answer }]);
      expect(est.has(practiceProbe.practice!)).toBe(answer === "yes" || answer === "probably");
    }
  });

  it("ignores probes without a practice, and ignores unknown ids", () => {
    expect(establishedSteps(kb, [{ qid: signalProbe.id, answer: "yes" }]).size).toBe(0);
    expect(establishedSteps(kb, [{ qid: "nope", answer: "yes" }]).size).toBe(0);
  });
});
