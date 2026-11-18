import { describe, expect, it } from "vitest";
import { isSourced } from "@/core/escape";
import { packs } from "./packs";

/** The evidence rule for spec sheets: a sheet must not say more than the source does. */
describe("spec sheets keep to the evidence rule", () => {
  for (const pack of Object.values(packs)) {
    const sheets = pack.sheets ?? {};
    const byId = new Map(pack.kb.solutions.map((s) => [s.id, s]));

    it(`${pack.id}: every sheet belongs to a move in the pack`, () => {
      for (const id of Object.keys(sheets)) expect(byId.has(id), `${pack.id}/${id}`).toBe(true);
    });

    it(`${pack.id}: a sheet exists only for a move that names a source`, () => {
      for (const id of Object.keys(sheets)) {
        expect(isSourced(byId.get(id)?.source), `${pack.id}/${id} has a sheet but names no source`).toBe(true);
      }
    });

    it(`${pack.id}: a level other than "none" needs a named source`, () => {
      for (const [id, sh] of Object.entries(sheets)) {
        if (sh.evidence.level !== "none") expect(isSourced(byId.get(id)?.source), `${pack.id}/${id}`).toBe(true);
      }
    });

    it(`${pack.id}: every text exists in both languages and is not empty`, () => {
      for (const [id, sh] of Object.entries(sheets)) {
        for (const [name, t] of [
          ["theory", sh.theory],
          ["evidence note", sh.evidence.note],
          ["unfitWhen", sh.unfitWhen],
        ] as const) {
          expect(t.ja.trim(), `${pack.id}/${id} ${name} ja`).not.toBe("");
          expect(t.en.trim(), `${pack.id}/${id} ${name} en`).not.toBe("");
        }
      }
    });

    it(`${pack.id}: no sheet claims a move works (no "proven" or "effective" wording)`, () => {
      const banned = [/proven/i, /\beffective\b/i, /guarantee/i, /実証/, /必ず効/, /確実に効/];
      for (const [id, sh] of Object.entries(sheets)) {
        const text = [sh.theory.en, sh.theory.ja, sh.evidence.note.en, sh.evidence.note.ja, sh.unfitWhen.en, sh.unfitWhen.ja].join(" ");
        for (const b of banned) expect(b.test(text), `${pack.id}/${id} matches ${b}`).toBe(false);
      }
    });
  }

  it("the developer pack has a sheet for each of the eight moves that name a source", () => {
    const sourced = packs.devstuck.kb.solutions.filter((s) => isSourced(s.source)).map((s) => s.id).sort();
    expect(Object.keys(packs.devstuck.sheets ?? {}).sort()).toEqual(sourced);
  });

  it("the two moves backed by a study of the problem are marked problem-studied, the rest method-published", () => {
    const sh = packs.devstuck.sheets!;
    expect(sh["fresh-context"].evidence.level).toBe("problem-studied");
    expect(sh["refute"].evidence.level).toBe("problem-studied");
    for (const id of ["fix-repro", "make-minimal", "add-evidence", "predict", "diff-change", "split-problem"]) {
      expect(sh[id].evidence.level, id).toBe("method-published");
    }
  });
});
