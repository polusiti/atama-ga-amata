import { describe, expect, it } from "vitest";
import { diagnose, explain, listPacks, nextQuestion, pitCheckTool } from "./tools";

type Data = Record<string, any>;
const data = (r: { ok: boolean; data?: unknown; error?: string }) => {
  expect(r.ok).toBe(true);
  return (r as { data: Data }).data;
};

describe("mcp tools", () => {
  it("lists both packs with needs and moves", () => {
    const d = data(listPacks()) as Data[];
    expect(d.map((p) => p.id).sort()).toEqual(["devstuck", "everyday"]);
    expect(d[0].needs.length).toBeGreaterThan(0);
  });

  it("asks a first question and does not stop with no answers", () => {
    const d = data(nextQuestion({ pack: "devstuck", answers: [] }));
    expect(d.stop).toBeNull();
    expect(typeof d.question.id).toBe("string");
  });

  it("is deterministic and stateless", () => {
    const a = nextQuestion({ pack: "devstuck", answers: [] });
    const b = nextQuestion({ pack: "devstuck", answers: [] });
    expect(a).toEqual(b);
  });

  it("never asks a question twice and stops within the budget", () => {
    const answers: { qid: string; answer: string }[] = [];
    for (let i = 0; i < 20; i++) {
      const d = data(nextQuestion({ answers }));
      if (d.stop) {
        expect(answers.length).toBeLessThanOrEqual(d.budget);
        return;
      }
      expect(answers.some((x) => x.qid === d.question.id)).toBe(false);
      answers.push({ qid: d.question.id, answer: "no" });
    }
    throw new Error("did not stop");
  });

  it("diagnose returns probabilities that sum to 1 and sourced moves", () => {
    const first = data(nextQuestion({ answers: [] }));
    const d = data(diagnose({ answers: [{ qid: first.question.id, answer: "yes" }] }));
    const sum = (d.needs as { probability: number }[]).reduce((s, n) => s + n.probability, 0);
    expect(sum).toBeGreaterThan(0.99);
    expect(sum).toBeLessThan(1.01);
    for (const m of d.moves as { source: string }[]) expect(m.source.length).toBeGreaterThan(0);
  });

  it("explain gives one factor per answer", () => {
    const first = data(nextQuestion({ answers: [] }));
    const needId = (data(listPacks()) as Data[])[0].needs[0].id;
    const d = data(explain({ need: needId, answers: [{ qid: first.question.id, answer: "yes" }] }));
    expect(d.how).toHaveLength(1);
  });

  it("returns errors for bad input instead of throwing", () => {
    expect(nextQuestion({ pack: "nope" })).toMatchObject({ ok: false });
    expect(nextQuestion({ answers: [{ qid: "nope", answer: "yes" }] })).toMatchObject({ ok: false });
    const q = (data(nextQuestion({ answers: [] })) as Data).question.id;
    expect(diagnose({ answers: [{ qid: q, answer: "maybe" }] })).toMatchObject({ ok: false });
    expect(diagnose({ answers: [{ qid: q, answer: "yes" }, { qid: q, answer: "no" }] })).toMatchObject({ ok: false });
    expect(explain({ need: "nope" })).toMatchObject({ ok: false });
    expect(diagnose({ pack: "__proto__" })).toMatchObject({ ok: false });
  });
});

describe("pit_check", () => {
  const same = (n: number) => Array.from({ length: n }, () => ({ newApproach: false, newFact: false }));

  it("persists at the start and returns no exit moves", () => {
    const d = data(pitCheckTool({ attempts: [] }));
    expect(d.verdict).toBe("persist");
    expect(d.exitMoves).toEqual([]);
  });

  it("switches after repeated failures of the same approach and returns only moves that name a source", () => {
    const d = data(pitCheckTool({ attempts: same(4) }));
    expect(d.verdict).toBe("switch");
    expect(d.chanceNextTryOfSameApproachWorks).toBeLessThan(d.chanceFreshApproachWorks);
    expect(d.exitMoves.length).toBeGreaterThan(0);
    expect(d.exitMoves.length).toBeLessThanOrEqual(3);
    for (const m of d.exitMoves) expect(m.source).not.toBe("Rule of thumb, not tested");
  });

  it("states both chances and that the numbers are set by hand, and no count of tries as a rule", () => {
    const d = data(pitCheckTool({ attempts: same(3) }));
    expect(typeof d.chanceNextTryOfSameApproachWorks).toBe("number");
    expect(typeof d.chanceFreshApproachWorks).toBe("number");
    expect(d.numbersAreSetByHand).toBeDefined();
    expect(JSON.stringify(d)).not.toMatch(/after \d+ tries/i);
  });

  it("a new approach resets the count: a long history that ends with a new approach persists", () => {
    const d = data(pitCheckTool({ attempts: [...same(8), { newApproach: true, newFact: true }] }));
    expect(d.sameApproachFailuresInRun).toBe(0);
    expect(d.verdict).toBe("persist");
  });

  it("a history made only of new approaches never says switch", () => {
    const d = data(pitCheckTool({ attempts: Array.from({ length: 10 }, () => ({ newApproach: true })) }));
    expect(d.verdict).toBe("persist");
  });

  it("is deterministic", () => {
    expect(pitCheckTool({ attempts: same(4) })).toEqual(pitCheckTool({ attempts: same(4) }));
  });

  it("returns errors for bad input instead of throwing", () => {
    expect(pitCheckTool({ attempts: [{ newApproach: "yes" } as never] })).toMatchObject({ ok: false });
    expect(pitCheckTool({ attempts: "none" as never })).toMatchObject({ ok: false });
    expect(pitCheckTool({ attempts: same(3), pack: "nope" })).toMatchObject({ ok: false });
  });

  it("uses the cause answers to rank the exits (no reproduction first leads to a reproduction move)", () => {
    const d = data(pitCheckTool({ attempts: same(4), answers: [{ qid: "s-flaky", answer: "yes" }] }));
    expect(d.exitMoves.map((m: { id: string }) => m.id)).toContain("fix-repro");
  });
});