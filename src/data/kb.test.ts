import { describe, expect, it } from "vitest";
import { readText } from "@/core/evidence";
import { hasCycle } from "@/core/fringe";
import { packs } from "./packs";

const inUnit = (x: number) => x >= 0 && x <= 1;

for (const pack of Object.values(packs)) {
  const { kb, lexicon } = pack;
  const needIds = new Set(kb.needs.map((n) => n.id));
  const solutionIds = new Set(kb.solutions.map((s) => s.id));

  describe(`knowledge base integrity: ${pack.id}`, () => {
    it("has unique ids in every collection", () => {
      for (const items of [kb.needs, kb.questions, kb.solutions]) {
        const ids = items.map((i) => i.id);
        expect(new Set(ids).size).toBe(ids.length);
      }
    });

    it("only references needs and steps that exist, with values in [0, 1]", () => {
      for (const q of kb.questions) {
        expect(inUnit(q.base)).toBe(true);
        expect(q.cost).toBeGreaterThan(0);
        for (const [id, v] of Object.entries(q.yes)) {
          expect(needIds.has(id), `${q.id} -> ${id}`).toBe(true);
          expect(inUnit(v)).toBe(true);
        }
        if (q.practice) expect(solutionIds.has(q.practice), `${q.id} practice ${q.practice}`).toBe(true);
      }
      for (const s of kb.solutions) {
        for (const [id, v] of Object.entries(s.fit)) {
          expect(needIds.has(id), `${s.id} -> ${id}`).toBe(true);
          expect(inUnit(v)).toBe(true);
        }
        for (const r of s.requires ?? []) expect(solutionIds.has(r), `${s.id} requires ${r}`).toBe(true);
        expect(s.requirements.length).toBeGreaterThan(0);
      }
    });

    it("has Japanese and English text everywhere", () => {
      const texts = [
        ...kb.needs.flatMap((n) => [n.short, n.title, n.gloss]),
        ...kb.questions.map((q) => q.text),
        ...kb.solutions.flatMap((s) => [s.title, s.pitch, s.cost, ...s.requirements, ...(s.source ? [s.source] : [])]),
      ];
      for (const t of texts) {
        expect(t.ja.length).toBeGreaterThan(0);
        expect(t.en.length).toBeGreaterThan(0);
      }
    });

    it("gives every need at least one step that fits it well", () => {
      for (const need of kb.needs) {
        const best = Math.max(...kb.solutions.map((s) => s.fit[need.id] ?? 0));
        expect(best, need.id).toBeGreaterThanOrEqual(0.7);
      }
    });

    it("has an acyclic prerequisite relation", () => {
      expect(hasCycle(kb)).toBe(false);
    });

    it("keeps the lexicon inside the pack", () => {
      for (const id of Object.keys(lexicon.needWords)) expect(needIds.has(id), `lexicon need ${id}`).toBe(true);
      for (const id of Object.keys(lexicon.solutionAliases)) expect(solutionIds.has(id), `alias ${id}`).toBe(true);
      for (const need of kb.needs) expect(lexicon.needWords[need.id]?.length ?? 0, need.id).toBeGreaterThan(0);
    });

    it("recognizes every authored sample sentence (a regression check, not a measure of accuracy)", () => {
      for (const s of pack.samples) {
        expect(readText(kb, s.ja, lexicon).top, s.ja).toBe(s.needId);
        expect(readText(kb, s.en, lexicon).top, s.en).toBe(s.needId);
      }
    });
  });
}

describe("user-side causes (self-checkable stalls)", () => {
  const { kb } = packs.devstuck;
  const selfNeeds = kb.needs.filter((n) => n.side === "self");

  it("has at least four self-checkable stall types", () => {
    expect(selfNeeds.length).toBeGreaterThanOrEqual(4);
  });

  it("gives each one a move that fits it, a practice probe and a signal probe", () => {
    for (const need of selfNeeds) {
      const moves = kb.solutions.filter((s) => (s.fit[need.id] ?? 0) >= 0.7);
      expect(moves.length, `${need.id} move`).toBeGreaterThanOrEqual(1);
      const probes = kb.questions.filter((q) => q.yes[need.id] !== undefined);
      expect(probes.some((q) => q.practice), `${need.id} practice probe`).toBe(true);
      expect(probes.some((q) => !q.practice), `${need.id} signal probe`).toBe(true);
    }
  });

  it("states a source or a rule-of-thumb label for the moves that serve them", () => {
    for (const need of selfNeeds) {
      for (const s of kb.solutions.filter((x) => (x.fit[need.id] ?? 0) >= 0.7)) {
        expect(s.source, s.id).toBeDefined();
      }
    }
  });

  it("does not blame the person in any wording (no second-person fault phrases)", () => {
    const banned = [/あなたが悪/, /あなたのせい/, /your fault/i, /you are to blame/i, /you're the problem/i, /あなたが原因/];
    const texts = [
      ...kb.needs.flatMap((n) => [n.title, n.gloss]),
      ...kb.solutions.flatMap((s) => [s.title, s.pitch, s.cost, ...s.requirements]),
      ...kb.questions.map((q) => q.text),
    ];
    for (const t of texts) {
      for (const re of banned) {
        expect(re.test(t.ja) || re.test(t.en), `${t.ja} / ${t.en}`).toBe(false);
      }
    }
  });
});

describe("problem-solving pack (requirement 9)", () => {
  it("states a source, or says it is a rule of thumb, for every step", () => {
    for (const s of packs.devstuck.kb.solutions) {
      expect(s.source, s.id).toBeDefined();
    }
  });

  it("has at least one step with no prerequisite and at least one with prerequisites", () => {
    const sols = packs.devstuck.kb.solutions;
    expect(sols.some((s) => (s.requires ?? []).length === 0)).toBe(true);
    expect(sols.some((s) => (s.requires ?? []).length > 0)).toBe(true);
  });

  it("includes reverse-keyed probes (a yes that lowers a stall) and signal probes (a yes that raises it)", () => {
    const qs = packs.devstuck.kb.questions;
    expect(qs.some((q) => q.practice)).toBe(true);
    expect(qs.some((q) => !q.practice)).toBe(true);
  });
});

describe("evidence rule: every move in every pack states a source or the rule-of-thumb label", () => {
  for (const pack of Object.values(packs)) {
    it(`${pack.id}`, () => {
      for (const s of pack.kb.solutions) {
        expect(s.source?.en?.trim(), `${pack.id}/${s.id} en`).toBeTruthy();
        expect(s.source?.ja?.trim(), `${pack.id}/${s.id} ja`).toBeTruthy();
      }
    });
  }
});
