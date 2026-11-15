import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { kb } from "../data/kb";
import { decide, render, templates, type Kind, type Lookup } from "./dialogue";
import { replayBelief } from "./engine";
import { MAX_POINTS, POINT_GAIN, readText } from "./evidence";
import { samples } from "./lexicon";
import { normalize } from "./normalize";
import { sum, uniform } from "./math";

const N = kb.needs.length;
const lookup: Lookup = {
  need: (id, lang) => kb.needs.find((n) => n.id === id)!.short[lang],
  solution: (id, lang) => kb.solutions.find((s) => s.id === id)!.title[lang],
};
const KINDS = Object.keys(templates) as Kind[];

describe("normalize", () => {
  it("folds width, case, katakana and punctuation", () => {
    expect(normalize("Ｃａｎ’ｔ  Find!")).toBe(normalize("cant find"));
    expect(normalize("キャッシュ")).toBe("きゃっしゅ");
    expect(normalize("ﾒﾓ、ファイル。")).toBe("めもふぁいる");
  });

  it("is idempotent", () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        expect(normalize(normalize(s))).toBe(normalize(s));
      }),
    );
  });
});

describe("readText: evidence", () => {
  it("is exactly neutral when nothing matches", () => {
    const r = readText(kb, "今日は天気がいいですね");
    expect(r.likelihood.every((x) => x === 1)).toBe(true);
    expect(r.top).toBeNull();
    expect(r.named).toBeNull();
  });

  it("is bounded for any text", () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 200 }), (s) => {
        const r = readText(kb, s);
        r.likelihood.forEach((x) => {
          expect(x).toBeGreaterThanOrEqual(1);
          expect(x).toBeLessThanOrEqual(1 + POINT_GAIN * MAX_POINTS + 1e-12);
        });
      }),
    );
  });

  it("never picks a top need when two tie", () => {
    // "お金" (spend-blind, 2) and "期限" (forget-deadline, 2) tie.
    const r = readText(kb, "お金と期限");
    expect(r.top).toBeNull();
  });

  it("recognizes every authored sample in Japanese and English", () => {
    for (const s of samples) {
      expect(readText(kb, s.ja).top, s.ja).toBe(s.needId);
      expect(readText(kb, s.en).top, s.en).toBe(s.needId);
    }
  });

  it("detects a named solution only with a want-marker", () => {
    expect(readText(kb, "キャッシュを追加したい").named).toBe("add-cache");
    expect(readText(kb, "家計簿が欲しい").named).toBe("expense-ledger");
    expect(readText(kb, "キャッシュのことを考えている").named).toBeNull();
    expect(readText(kb, "I want a reminder").named).toBe("deadline-reminder");
  });
});

describe("replayBelief with notes", () => {
  const noteArb = fc.array(
    fc.array(fc.double({ min: 1, max: 4.2, noNaN: true }), { minLength: N, maxLength: N }),
    { maxLength: 4 },
  );

  it("does not depend on the order of notes", () => {
    fc.assert(
      fc.property(noteArb, (notes) => {
        const a = replayBelief(kb, null, [], undefined, notes);
        const b = replayBelief(kb, null, [], undefined, [...notes].reverse());
        a.forEach((x, i) => expect(x).toBeCloseTo(b[i], 10));
        expect(sum(a)).toBeCloseTo(1, 10);
      }),
    );
  });

  it("leaves the belief unchanged when the note is neutral", () => {
    const b = replayBelief(kb, null, [], undefined, [new Array(N).fill(1)]);
    b.forEach((x, i) => expect(x).toBeCloseTo(uniform(N)[i], 12));
  });

  it("moves belief toward the matched need", () => {
    const r = readText(kb, "締め切りをうっかり忘れる");
    const b = replayBelief(kb, null, [], undefined, [r.likelihood]);
    const idx = kb.needs.findIndex((n) => n.id === "forget-deadline");
    expect(b[idx]).toBe(Math.max(...b));
    expect(b[idx]).toBeGreaterThan(1 / N);
  });
});

describe("dialogue", () => {
  const reading = (over: Partial<ReturnType<typeof readText>>) => ({ ...readText(kb, ""), ...over });

  it("prefers a named solution over a matched need, and a need over the fallback", () => {
    expect(decide({ event: "text", history: [], reading: reading({ named: "add-cache", top: "slow-unknown" }) }).kind).toBe("ladder");
    expect(decide({ event: "text", history: [], reading: reading({ top: "slow-unknown" }) }).kind).toBe("reflect");
    expect(decide({ event: "text", history: [], reading: reading({}) }).kind).toBe("fallback");
  });

  it("is deterministic", () => {
    fc.assert(
      fc.property(fc.array(fc.constantFrom(...KINDS), { maxLength: 6 }), (history) => {
        const input = { event: "load" as const, history };
        expect(decide(input)).toEqual(decide(input));
      }),
    );
  });

  it("summarizes with the first statement only when there is one", () => {
    expect(decide({ event: "stop", history: [], topNeedId: "spend-blind", first: "お金が" }).kind).toBe("summary");
    expect(decide({ event: "stop", history: [], topNeedId: "spend-blind", first: null }).kind).toBe("summaryPlain");
  });

  it("gives a different line the next time the same kind is used", () => {
    for (const kind of KINDS) {
      for (const lang of ["ja", "en"] as const) {
        expect(templates[kind][lang].length, `${kind}/${lang}`).toBeGreaterThanOrEqual(2);
      }
    }
    const first = decide({ event: "load", history: [] });
    const second = decide({ event: "load", history: ["greet"] });
    expect(render(first, "ja", lookup)).not.toBe(render(second, "ja", lookup));
    expect(render(first, "en", lookup)).not.toBe(render(second, "en", lookup));
  });

  it("never claims to understand, in any template", () => {
    const banned = [/分かりました/, /理解しました/, /わかります/, /分かります/, /\bI understand\b/i, /\bI know how you feel\b/i];
    for (const kind of KINDS) {
      for (const lang of ["ja", "en"] as const) {
        for (const t of templates[kind][lang]) {
          banned.forEach((re) => expect(re.test(t), t).toBe(false));
        }
      }
    }
  });

  it("fills every placeholder", () => {
    const utterances = [
      { kind: "reflect", variant: 0, needId: "spend-blind" },
      { kind: "ladder", variant: 1, solutionId: "add-cache" },
      { kind: "summary", variant: 0, needId: "spend-blind", first: "お金が消える" },
      { kind: "summaryPlain", variant: 1, needId: "spend-blind" },
      { kind: "confirm", variant: 0, solutionId: "add-cache", fit: 0.31 },
    ] as const;
    for (const u of utterances) {
      for (const lang of ["ja", "en"] as const) {
        const text = render(u, lang, lookup);
        expect(text, `${u.kind}/${lang}`).not.toMatch(/\{|\}/);
        expect(text.length).toBeGreaterThan(10);
      }
    }
    expect(render({ kind: "confirm", variant: 0, solutionId: "add-cache", fit: 0.31 }, "ja", lookup)).toContain("31%");
  });
});

