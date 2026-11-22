import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { seedWords, shakeDeck } from "@/data/shake-deck";
import { textProblem } from "./ideas";
import { MAX_MINUTES, MIN_MINUTES, SHAKE_COUNT, SHAKE_LIMITS, checkShakes, deckToShakes, drawFromDeck, type Shake } from "./shake";

const three = (over: Partial<Shake>[] = []): Shake[] =>
  [
    { title: "Run it backwards", how: "Do the steps in the opposite order for five minutes.", minutes: 5 },
    { title: "Cut it in half", how: "Remove half of the input and see if it still fails.", minutes: 8 },
    { title: "Draw it", how: "Draw the data flow with arrows on paper.", minutes: 6 },
  ].map((s, i) => ({ ...s, ...(over[i] ?? {}) }));

describe("checkShakes: what is accepted", () => {
  it("accepts three provocations as an object, an array or JSON text", () => {
    const s = three();
    expect(checkShakes({ moves: s }).shakes).toEqual(s);
    expect(checkShakes(s).shakes).toEqual(s);
    expect(checkShakes(JSON.stringify({ moves: s })).shakes).toEqual(s);
  });

  it("accepts the largest allowed lengths and the two ends of the time box", () => {
    const r = checkShakes(three([{ title: "t".repeat(SHAKE_LIMITS.title), how: "h".repeat(SHAKE_LIMITS.how), minutes: MIN_MINUTES }, { minutes: MAX_MINUTES }]));
    expect(r.reason).toBeNull();
  });
});

describe("checkShakes: what is rejected", () => {
  it("rejects a wrong count, a wrong container and broken JSON", () => {
    expect(checkShakes(three().slice(0, 2)).reason).toBe("wrong-count");
    expect(checkShakes([...three(), three()[0]]).reason).toBe("wrong-count");
    expect(checkShakes({ moves: three(), extra: 1 }).reason).toBe("wrong-container");
    expect(checkShakes("{").reason).toBe("not-json");
  });

  it("rejects missing, extra and mistyped fields", () => {
    const [a, b, c] = three();
    const { how: _h, ...noHow } = a;
    expect(checkShakes([noHow, b, c]).reason).toBe("wrong-fields");
    expect(checkShakes([{ ...a, advice: "x" }, b, c]).reason).toBe("wrong-fields");
    expect(checkShakes([{ ...a, title: 5 }, b, c]).reason).toBe("bad-text:not-text");
  });

  it("rejects a time box that is not an integer from 1 to 10", () => {
    for (const minutes of [0, 11, 2.5, -1, "5", null, NaN]) {
      expect(checkShakes([{ ...three()[0], minutes } as unknown as Shake, three()[1], three()[2]]).reason, String(minutes)).toBe("bad-minutes");
    }
  });

  it("rejects text that is too long, unless the worker may cut it", () => {
    const long = three([{ how: "First sentence. " + "More words here. ".repeat(20) }]);
    expect(checkShakes(long).reason).toBe("bad-text:too-long");
    expect(checkShakes(long, { trimToFit: true }).reason).toBeNull();
  });

  it("rejects claims of having run code, code blocks, URLs and disclaimers, in any text field", () => {
    const bad = ["I ran it and it works.", "実行して確かめました。", "```js\nx\n```", "See https://example.com.", "As an AI, I cannot know."];
    for (const text of bad) {
      for (const field of ["title", "how"] as const) expect(checkShakes(three([{ [field]: text }])).reason, `${field}: ${text}`).not.toBeNull();
    }
  });

  it("rejects two provocations with the same title, even if only the case differs", () => {
    expect(checkShakes(three([{}, { title: "RUN IT BACKWARDS" }])).reason).toBe("duplicate-title");
  });

  it("rejects an answer in the wrong language when one is asked for", () => {
    expect(checkShakes(three(), { lang: "ja" }).reason).toBe("wrong-language");
    const ja = three([
      { title: "逆の順番でやる", how: "手順を、逆の順番で、5分やる。" },
      { title: "半分に切る", how: "入力の半分を外して、まだ失敗するか見る。" },
      { title: "紙に描く", how: "データの流れを、矢印で紙に描く。" },
    ]);
    expect(checkShakes(ja, { lang: "ja" }).reason).toBeNull();
    expect(checkShakes(ja, { lang: "en" }).reason).toBe("wrong-language");
    expect(checkShakes(three(), { lang: "en" }).reason).toBeNull();
  });
});

describe("checkShakes: soundness", () => {
  it("whatever it accepts has three distinct titles, within the limits, with a time box from 1 to 10", () => {
    const item = fc.record({ title: fc.string({ maxLength: 60 }), how: fc.string({ maxLength: 180 }), minutes: fc.integer({ min: -2, max: 14 }) });
    fc.assert(
      fc.property(fc.array(item, { minLength: 2, maxLength: 4 }), (arr) => {
        const out = checkShakes(arr).shakes;
        if (out === null) return;
        expect(out.length).toBe(SHAKE_COUNT);
        expect(new Set(out.map((s) => s.title.toLowerCase())).size).toBe(SHAKE_COUNT);
        for (const s of out) {
          expect(s.title.length).toBeLessThanOrEqual(SHAKE_LIMITS.title);
          expect(s.how.length).toBeLessThanOrEqual(SHAKE_LIMITS.how);
          expect(s.minutes).toBeGreaterThanOrEqual(MIN_MINUTES);
          expect(s.minutes).toBeLessThanOrEqual(MAX_MINUTES);
        }
      }),
    );
  });

  it("is sound for any value", () => {
    fc.assert(fc.property(fc.anything(), (raw) => void checkShakes(raw)));
  });
});

describe("the deck written by the author", () => {
  it("has at least twenty entries with distinct ids and distinct titles in each language", () => {
    expect(shakeDeck.length).toBeGreaterThanOrEqual(20);
    expect(new Set(shakeDeck.map((e) => e.id)).size).toBe(shakeDeck.length);
    expect(new Set(shakeDeck.map((e) => e.title.en.toLowerCase())).size).toBe(shakeDeck.length);
    expect(new Set(shakeDeck.map((e) => e.title.ja)).size).toBe(shakeDeck.length);
  });

  it("passes the same rules as the model's answers, entry by entry, in both languages", () => {
    for (const lang of ["en", "ja"] as const) {
      for (const e of shakeDeck) {
        const s = deckToShakes([e], lang)[0];
        expect(textProblem(s.title, SHAKE_LIMITS.title), `${e.id} ${lang} title`).toBeNull();
        expect(textProblem(s.how, SHAKE_LIMITS.how), `${e.id} ${lang} how`).toBeNull();
        expect(Number.isInteger(s.minutes) && s.minutes >= MIN_MINUTES && s.minutes <= MAX_MINUTES, `${e.id} minutes`).toBe(true);
      }
    }
  });

  it("any three drawn from it pass the whole check, in both languages", () => {
    fc.assert(
      fc.property(fc.array(fc.double({ min: 0, max: 0.999999, noNaN: true }), { minLength: 3, maxLength: 3 }), (rs) => {
        let i = 0;
        const drawn = drawFromDeck(shakeDeck, SHAKE_COUNT, () => rs[i++ % rs.length]);
        for (const lang of ["en", "ja"] as const) expect(checkShakes(deckToShakes(drawn, lang), { lang }).reason, lang).toBeNull();
      }),
    );
  });

  it("keeps the English free of Japanese and the Japanese in Japanese", () => {
    for (const e of shakeDeck) {
      expect(/[\u3040-\u30ff\u4e00-\u9fff]/.test(e.title.en + e.how.en), `${e.id} en`).toBe(false);
      expect((e.title.ja + e.how.ja).match(/[\u3040-\u30ff\u4e00-\u9fff]/g)?.length ?? 0, `${e.id} ja`).toBeGreaterThanOrEqual(4);
    }
  });

  it("is safe: no entry tells the person to delete data, touch production or run unknown code", () => {
    const risky = /\b(delete|drop|rm -rf|production|prod\b|format the disk|sudo)\b|本番|削除する|消去/i;
    for (const e of shakeDeck) {
      expect(risky.test(e.title.en + " " + e.how.en + " " + e.title.ja + " " + e.how.ja), e.id).toBe(false);
    }
  });
});

describe("drawFromDeck", () => {
  it("returns n distinct entries, and the same draw for the same random numbers", () => {
    const seq = [0.1, 0.5, 0.9];
    const mk = () => {
      let i = 0;
      return () => seq[i++ % seq.length];
    };
    const a = drawFromDeck(shakeDeck, 3, mk());
    const b = drawFromDeck(shakeDeck, 3, mk());
    expect(a.map((e) => e.id)).toEqual(b.map((e) => e.id));
    expect(new Set(a.map((e) => e.id)).size).toBe(3);
  });

  it("returns the whole deck when asked for more than it has, and nothing for zero", () => {
    expect(drawFromDeck(shakeDeck, 999).length).toBe(shakeDeck.length);
    expect(drawFromDeck(shakeDeck, 0)).toEqual([]);
  });

  it("can reach every entry (a uniform source of randomness gives each one a chance)", () => {
    const seen = new Set<string>();
    for (let k = 0; k < 400; k++) for (const e of drawFromDeck(shakeDeck, 3)) seen.add(e.id);
    expect(seen.size).toBe(shakeDeck.length);
  });
});

describe("seed words", () => {
  it("are plain single words, with no repeats", () => {
    expect(seedWords.length).toBeGreaterThanOrEqual(40);
    expect(new Set(seedWords).size).toBe(seedWords.length);
    for (const w of seedWords) expect(/^[a-z]+$/.test(w), w).toBe(true);
  });
});
