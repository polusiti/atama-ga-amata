import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { packs } from "@/data/packs";
import { hasGaps, needCoverage } from "./coverage";
import type { KnowledgeBase, Lexicon } from "./types";

const t = (s: string) => ({ ja: s, en: s });
const need = (id: string) => ({ id, short: t(id), title: t(id), gloss: t(id) });
const emptyLex: Lexicon = { needWords: {}, solutionAliases: {}, wantMarkers: [] };

describe("needCoverage", () => {
  it("returns one row per need, in order, for every shipped pack", () => {
    for (const pack of Object.values(packs)) {
      const rows = needCoverage(pack.kb, pack.lexicon, pack.samples);
      expect(rows.map((r) => r.needId)).toEqual(pack.kb.needs.map((n) => n.id));
    }
  });

  it("reports every gap on an empty pack", () => {
    const kb: KnowledgeBase = { needs: [need("a")], questions: [], solutions: [] };
    const [row] = needCoverage(kb, emptyLex, []);
    expect(row.gaps.sort()).toEqual(["no discriminating probe", "no fitting move", "no lexicon word", "no sample sentence"]);
  });

  it("reports no gap for a complete need", () => {
    const kb: KnowledgeBase = {
      needs: [need("a")],
      questions: [{ id: "q", text: t("q"), cost: 1, base: 0.2, yes: { a: 0.9 } }],
      solutions: [{ id: "s", title: t("s"), pitch: t("s"), cost: t("s"), fit: { a: 0.8 }, requirements: [], source: t("Zeller 2009") }],
    };
    const lex: Lexicon = { needWords: { a: [["word", 1]] }, solutionAliases: {}, wantMarkers: [] };
    const rows = needCoverage(kb, lex, [{ needId: "a" }]);
    expect(rows[0].gaps).toEqual([]);
    expect(rows[0].sourcedMoves).toBe(1);
    expect(hasGaps(rows)).toBe(false);
  });

  it("does not count a rule-of-thumb label as a source", () => {
    const kb: KnowledgeBase = {
      needs: [need("a")],
      questions: [],
      solutions: [
        { id: "s", title: t("s"), pitch: t("s"), cost: t("s"), fit: { a: 0.8 }, requirements: [], source: { ja: "経験則（検証していません）", en: "Rule of thumb, not tested" } },
      ],
    };
    expect(needCoverage(kb, emptyLex, [])[0].sourcedMoves).toBe(0);
  });

  it("is deterministic and never reports more sourced moves than moves (property)", () => {
    fc.assert(
      fc.property(fc.array(fc.double({ min: 0, max: 1, noNaN: true }), { minLength: 1, maxLength: 8 }), (fits) => {
        const kb: KnowledgeBase = {
          needs: [need("a")],
          questions: [],
          solutions: fits.map((f, i) => ({
            id: `s${i}`, title: t("s"), pitch: t("s"), cost: t("s"), fit: { a: f }, requirements: [], source: i % 2 ? t("Zeller") : undefined,
          })),
        };
        const a = needCoverage(kb, emptyLex, []);
        const b = needCoverage(kb, emptyLex, []);
        expect(a).toEqual(b);
        expect(a[0].sourcedMoves).toBeLessThanOrEqual(a[0].moves);
      }),
    );
  });
});
