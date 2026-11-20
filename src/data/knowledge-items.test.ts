import { describe, expect, it } from "vitest";
import { TOPICS } from "@/core/knowledge";
import { knowledgeItems } from "./knowledge-items";

describe("knowledge items: the data", () => {
  it("has exactly one item per topic and level (1, 2, 3), with unique ids", () => {
    expect(new Set(knowledgeItems.map((i) => i.id)).size).toBe(knowledgeItems.length);
    for (const t of TOPICS) {
      const levels = knowledgeItems.filter((i) => i.topic === t).map((i) => i.level).sort();
      expect(levels, t).toEqual([1, 2, 3]);
    }
    expect(knowledgeItems.length).toBe(TOPICS.length * 3);
  });

  it("has five statements and a wrong index inside them, in every item", () => {
    for (const i of knowledgeItems) {
      expect(i.statements.length, i.id).toBe(5);
      expect([0, 1, 2, 3, 4], i.id).toContain(i.wrong);
    }
  });

  it("has every text in both languages, not empty", () => {
    for (const i of knowledgeItems) {
      const texts = [i.stem, i.why, ...i.statements];
      for (const t of texts) {
        expect(t.en.trim().length, `${i.id} en`).toBeGreaterThan(0);
        expect(t.ja.trim().length, `${i.id} ja`).toBeGreaterThan(0);
        expect(/[\u3040-\u30ff\u4e00-\u9fff]/.test(t.ja), `${i.id} ja has Japanese`).toBe(true);
      }
    }
  });

  it("has no two statements that are the same within an item", () => {
    for (const i of knowledgeItems) {
      expect(new Set(i.statements.map((s) => s.en)).size, i.id).toBe(5);
    }
  });

  it("gives every item a source: a URL read on a date, or a premise stated in the question", () => {
    for (const i of knowledgeItems) {
      if ("url" in i.source) {
        expect(i.source.url, i.id).toMatch(/^https:\/\//);
        expect(i.source.checked, i.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      } else {
        expect(i.source.premise, i.id).toBe(true);
        // A premise source needs the premise in the stem: a stem with a quoted reply.
        expect(i.stem.en.length, i.id).toBeGreaterThan(120);
      }
    }
  });

  it("does not put the wrong statement in the same place in every question", () => {
    const positions = new Set(knowledgeItems.map((i) => i.wrong));
    expect(positions.size).toBe(5);
    for (let p = 0; p < 5; p++) {
      const n = knowledgeItems.filter((i) => i.wrong === p).length;
      expect(n, `position ${p}`).toBeLessThanOrEqual(4);
    }
  });

  it("does not blame the person, and does not claim certainty about the person (voice)", () => {
    const banned = /\byou (failed|should have|did not|didn't)\b|あなたは.*(できていない|間違えた|知らない)/i;
    for (const i of knowledgeItems) {
      expect(banned.test(i.why.en), `${i.id} en`).toBe(false);
      expect(banned.test(i.why.ja), `${i.id} ja`).toBe(false);
    }
  });
});
