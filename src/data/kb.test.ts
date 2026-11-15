import { describe, expect, it } from "vitest";
import { kb } from "./kb";

const needIds = new Set(kb.needs.map((n) => n.id));
const inUnit = (x: number) => x >= 0 && x <= 1;

describe("knowledge base integrity", () => {
  it("has unique ids in every collection", () => {
    for (const items of [kb.needs, kb.questions, kb.solutions]) {
      const ids = items.map((i) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("only references needs that exist, with values in [0, 1]", () => {
    for (const q of kb.questions) {
      expect(inUnit(q.base)).toBe(true);
      expect(q.cost).toBeGreaterThan(0);
      for (const [id, v] of Object.entries(q.yes)) {
        expect(needIds.has(id), `${q.id} -> ${id}`).toBe(true);
        expect(inUnit(v)).toBe(true);
      }
    }
    for (const s of kb.solutions) {
      for (const [id, v] of Object.entries(s.fit)) {
        expect(needIds.has(id), `${s.id} -> ${id}`).toBe(true);
        expect(inUnit(v)).toBe(true);
      }
      expect(s.requirements.length).toBeGreaterThan(0);
    }
  });

  it("has Japanese and English text everywhere", () => {
    const texts = [
      ...kb.needs.flatMap((n) => [n.short, n.title, n.gloss]),
      ...kb.questions.map((q) => q.text),
      ...kb.solutions.flatMap((s) => [s.title, s.pitch, s.cost, ...s.requirements]),
    ];
    for (const t of texts) {
      expect(t.ja.length).toBeGreaterThan(0);
      expect(t.en.length).toBeGreaterThan(0);
    }
  });

  it("gives every need at least one solution that fits it well", () => {
    for (const need of kb.needs) {
      const best = Math.max(...kb.solutions.map((s) => s.fit[need.id] ?? 0));
      expect(best, need.id).toBeGreaterThanOrEqual(0.7);
    }
  });
});

