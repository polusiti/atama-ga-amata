import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { packs } from "@/data/packs";
import { exitMoves, isSourced, roughMoves } from "./escape";
import { replayBelief } from "./engine";
import type { KnowledgeBase } from "./types";

const kb = packs.devstuck.kb;
const L = (en: string) => ({ en, ja: en });

describe("isSourced", () => {
  it("accepts a named work or a study with a year", () => {
    expect(isSourced(L("Zeller, Why Programs Fail (TRAFFIC)"))).toBe(true);
    expect(isSourced(L("Zeller, delta debugging"))).toBe(true);
    expect(isSourced(L("Laban et al. 2025 (models do not recover from wrong turns). The restart routine is a rule of thumb, not tested"))).toBe(true);
    expect(isSourced(L("Sharma et al. 2023 (assistants tend to match the user's view). This way of asking is a rule of thumb, not tested"))).toBe(true);
  });

  it("rejects the rule-of-thumb label alone, and an empty or missing source", () => {
    expect(isSourced(L("Rule of thumb, not tested"))).toBe(false);
    expect(isSourced(L("Known as the XY problem. Rule of thumb, not tested"))).toBe(false);
    expect(isSourced(L("Known as rubber-duck debugging. Rule of thumb, not tested"))).toBe(false);
    expect(isSourced(L(""))).toBe(false);
    expect(isSourced(undefined)).toBe(false);
  });

  it("matches the developer pack exactly: eight moves name a source, nine do not", () => {
    const sourced = kb.solutions.filter((s) => isSourced(s.source)).map((s) => s.id).sort();
    expect(sourced).toEqual(
      ["add-evidence", "diff-change", "fix-repro", "fresh-context", "make-minimal", "predict", "refute", "split-problem"].sort(),
    );
    expect(kb.solutions.length - sourced.length).toBe(9);
  });
});

describe("exitMoves", () => {
  const beliefArb = fc
    .array(fc.double({ min: 0.001, max: 1, noNaN: true }), { minLength: kb.needs.length, maxLength: kb.needs.length })
    .map((xs) => {
      const s = xs.reduce((a, b) => a + b, 0);
      return xs.map((x) => x / s);
    });

  it("returns only sourced moves, at most n, ranked best first", () => {
    fc.assert(
      fc.property(beliefArb, fc.integer({ min: 0, max: 6 }), (b, n) => {
        const r = exitMoves(kb, b, n);
        expect(r.length).toBeLessThanOrEqual(n);
        r.forEach((m) => expect(isSourced(m.solution.source)).toBe(true));
        for (let i = 1; i < r.length; i++) expect(r[i - 1].score).toBeGreaterThanOrEqual(r[i].score - 1e-12);
      }),
    );
  });

  it("returns an empty list, not an unsourced move, when nothing names a source", () => {
    const bare: KnowledgeBase = {
      ...kb,
      solutions: kb.solutions.map((s) => ({ ...s, source: { en: "Rule of thumb, not tested", ja: "経験則（検証していません）" } })),
    };
    const b = replayBelief(bare, null, []);
    expect(exitMoves(bare, b, 3)).toEqual([]);
  });

  it("roughMoves and exitMoves never share a move", () => {
    const b = replayBelief(kb, null, []);
    const a = new Set(exitMoves(kb, b, 20).map((m) => m.solution.id));
    roughMoves(kb, b, 20).forEach((m) => expect(a.has(m.solution.id)).toBe(false));
  });

  it("for a person with no repro and no new facts, the first exit is a Zeller method", () => {
    const b = replayBelief(kb, null, [
      { qid: "s-flaky", answer: "yes" },
    ]);
    const first = exitMoves(kb, b, 1)[0];
    expect(first).toBeDefined();
    expect(isSourced(first.solution.source)).toBe(true);
  });
});
