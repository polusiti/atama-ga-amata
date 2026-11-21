import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { packs } from "@/data/packs";
import { isSourced } from "./escape";
import { IDEA_COUNT, LIMITS, OTHER, checkIdeas, fitTo, labelOf, looksJapanese, parseIdeas, type Idea } from "./ideas";

const solutions = packs.devstuck.kb.solutions;
const kinds = solutions.map((s) => s.id);

function good(over: Partial<Idea>[] = []): Idea[] {
  const base: Idea[] = [
    { kind: kinds[0], title: "Shrink it", how: "Cut everything not needed for the failure.", quickTest: "Cut half the code; if it still fails, keep cutting." },
    { kind: kinds[1], title: "Add logging", how: "Print the values you cannot see.", quickTest: "Compare a failing run with a passing run." },
    { kind: kinds[2], title: "Fresh chat", how: "Start a new conversation with the facts so far.", quickTest: "Ask the same question with only facts, no guesses." },
    { kind: kinds[3], title: "Read the docs", how: "Check the primary source for the option.", quickTest: "Find the option name in the official page." },
    { kind: OTHER, title: "Explain it aloud", how: "Say the problem out loud to someone.", quickTest: "Time yourself: if you cannot say it in a minute, the goal is unclear." },
  ];
  return base.map((b, i) => ({ ...b, ...(over[i] ?? {}) }));
}

describe("parseIdeas: what is accepted", () => {
  it("accepts five ideas of different kinds, as an object, an array or JSON text", () => {
    const ideas = good();
    expect(parseIdeas({ ideas }, kinds)).toEqual(ideas);
    expect(parseIdeas(ideas, kinds)).toEqual(ideas);
    expect(parseIdeas(JSON.stringify({ ideas }), kinds)).toEqual(ideas);
  });

  it("trims the text and keeps the order", () => {
    const out = parseIdeas(good([{ title: "  Shrink it  " }]), kinds);
    expect(out?.[0].title).toBe("Shrink it");
    expect(out?.map((i) => i.kind)).toEqual(good().map((i) => i.kind));
  });

  it("accepts the largest allowed lengths", () => {
    const out = parseIdeas(good([{ title: "t".repeat(LIMITS.title), how: "h".repeat(LIMITS.how), quickTest: "q".repeat(LIMITS.quickTest) }]), kinds);
    expect(out).not.toBeNull();
  });
});

describe("parseIdeas: the shape", () => {
  it("rejects a wrong count", () => {
    expect(parseIdeas(good().slice(0, 4), kinds)).toBeNull();
    expect(parseIdeas([...good(), good()[0]], kinds)).toBeNull();
    expect(parseIdeas([], kinds)).toBeNull();
  });

  it("rejects missing, extra and mistyped fields", () => {
    const ideas = good();
    const { how: _how, ...noHow } = ideas[0];
    expect(parseIdeas([noHow, ...ideas.slice(1)], kinds)).toBeNull();
    expect(parseIdeas([{ ...ideas[0], advice: "x" }, ...ideas.slice(1)], kinds)).toBeNull();
    expect(parseIdeas([{ ...ideas[0], title: 5 }, ...ideas.slice(1)], kinds)).toBeNull();
    expect(parseIdeas([{ ...ideas[0], quickTest: "" }, ...ideas.slice(1)], kinds)).toBeNull();
    expect(parseIdeas([{ ...ideas[0], title: "   " }, ...ideas.slice(1)], kinds)).toBeNull();
  });

  it("rejects text that is too long", () => {
    expect(parseIdeas(good([{ title: "t".repeat(LIMITS.title + 1) }]), kinds)).toBeNull();
    expect(parseIdeas(good([{ how: "h".repeat(LIMITS.how + 1) }]), kinds)).toBeNull();
    expect(parseIdeas(good([{ quickTest: "q".repeat(LIMITS.quickTest + 1) }]), kinds)).toBeNull();
  });

  it("rejects anything that is not an object, array or JSON of them", () => {
    for (const v of [null, undefined, 7, true, "hello", "{", "[1,2,3]", { ideas: "x" }, { ideas: good(), extra: 1 }]) expect(parseIdeas(v, kinds)).toBeNull();
  });
});

describe("parseIdeas: the spread of kinds", () => {
  it("rejects an unknown kind", () => {
    expect(parseIdeas(good([{ kind: "made-up-move" }]), kinds)).toBeNull();
  });

  it("rejects two ideas of the same kind, and two 'other'", () => {
    expect(parseIdeas(good([{}, { kind: kinds[0] }]), kinds)).toBeNull();
    expect(parseIdeas(good([{}, {}, {}, { kind: OTHER }]), kinds)).toBeNull();
  });

  it("rejects fewer than three kinds that are exit moves", () => {
    const two = good([{}, {}, {}, { kind: OTHER, title: "Other two" }, { kind: kinds[4], title: "Five" }]);
    // kinds: 0, 1, 2 are moves, 3 is other, 4 is a move: four moves, fine. Now make only two moves.
    expect(parseIdeas(two, kinds)).not.toBeNull();
    const tooFew = good([{}, {}, { kind: OTHER, title: "Other a" }, { kind: "other", title: "Other b" }, { kind: "other", title: "Other c" }]);
    expect(parseIdeas(tooFew, kinds)).toBeNull();
  });

  it("rejects two ideas with the same title, even if only the case differs", () => {
    expect(parseIdeas(good([{}, { title: "SHRINK IT" }]), kinds)).toBeNull();
  });
});

describe("parseIdeas: claims a model cannot make", () => {
  const bad = [
    "I ran the code and the test passes now.",
    "I have tested this on your build.",
    "I verified the fix works.",
    "I executed the script and it works.",
    "実行して確かめました。",
    "テストを確認しました。",
    "試してみました。",
    "```js\nconsole.log(1)\n```",
    "See https://example.com for details.",
    "As an AI, I cannot know.",
    "AIなので、確かなことは言えません。",
  ];
  it("rejects each of them, in any text field", () => {
    for (const text of bad) {
      for (const field of ["title", "how", "quickTest"] as const) {
        expect(parseIdeas(good([{ [field]: text }]), kinds), `${field}: ${text}`).toBeNull();
      }
    }
  });

  it("accepts ordinary advice that mentions running or testing as something the person does", () => {
    const ok = [
      "Run the failing test three times and write down how it fails.",
      "テストを3回実行して、失敗のしかたを書き留める。",
      "Check the log for the first error, not the last.",
    ];
    for (const text of ok) expect(parseIdeas(good([{ quickTest: text }]), kinds), text).not.toBeNull();
  });
});

describe("parseIdeas: soundness", () => {
  it("whatever it accepts has five distinct kinds, at least three of them moves, and fields within the limits", () => {
    const ideaArb = fc.record({ kind: fc.constantFrom(...kinds, OTHER, "x"), title: fc.string({ maxLength: 80 }), how: fc.string({ maxLength: 260 }), quickTest: fc.string({ maxLength: 200 }) });
    fc.assert(
      fc.property(fc.array(ideaArb, { minLength: 4, maxLength: 6 }), (arr) => {
        const out = parseIdeas(arr, kinds);
        if (out === null) return;
        expect(out.length).toBe(IDEA_COUNT);
        expect(new Set(out.map((i) => i.kind)).size).toBe(IDEA_COUNT);
        expect(out.filter((i) => i.kind !== OTHER).length).toBeGreaterThanOrEqual(3);
        for (const i of out) {
          expect(i.title.length).toBeLessThanOrEqual(LIMITS.title);
          expect(i.how.length).toBeLessThanOrEqual(LIMITS.how);
          expect(i.quickTest.length).toBeLessThanOrEqual(LIMITS.quickTest);
        }
      }),
    );
  });

  it("is sound for any value", () => {
    fc.assert(
      fc.property(fc.anything(), (raw) => {
        const out = parseIdeas(raw, kinds);
        if (out !== null) expect(out.length).toBe(IDEA_COUNT);
      }),
    );
  });
});

describe("labelOf", () => {
  it("labels a sourced move, a rule-of-thumb move and the model's own idea", () => {
    const sourced = solutions.find((s) => isSourced(s.source))!;
    const rough = solutions.find((s) => !isSourced(s.source))!;
    expect(labelOf({ kind: sourced.id, title: "a", how: "b", quickTest: "c" }, solutions, isSourced).kind).toBe("sourced");
    expect(labelOf({ kind: rough.id, title: "a", how: "b", quickTest: "c" }, solutions, isSourced).kind).toBe("rule-of-thumb");
    expect(labelOf({ kind: OTHER, title: "a", how: "b", quickTest: "c" }, solutions, isSourced).kind).toBe("other");
    expect(labelOf({ kind: "unknown-id", title: "a", how: "b", quickTest: "c" }, solutions, isSourced).kind).toBe("other");
  });
});

describe("fitTo: cutting a text that is too long", () => {
  it("leaves a text that fits exactly as it is (trimmed)", () => {
    expect(fitTo("Short text.", 50)).toBe("Short text.");
    expect(fitTo("  padded  ", 50)).toBe("padded");
  });

  it("cuts at the last end of a sentence that fits", () => {
    const text = "First part is here. Second part is here too. Third part runs on and on and on.";
    const out = fitTo(text, 48);
    expect(out).toBe("First part is here. Second part is here too.");
    expect(out.length).toBeLessThanOrEqual(48);
  });

  it("cuts a Japanese text at a full stop", () => {
    const out = fitTo("まず入力を減らします。次にログを足します。最後にもう一度試します。", 24);
    expect(out).toBe("まず入力を減らします。次にログを足します。");
  });

  it("cuts at the limit with an ellipsis when there is no useful end of a sentence", () => {
    const out = fitTo("x".repeat(100), 30);
    expect(out.length).toBe(30);
    expect(out.endsWith("\u2026")).toBe(true);
  });

  it("never returns more than the limit, and never changes a text that already fits", () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 400 }), fc.integer({ min: 10, max: 200 }), (s, max) => {
        const out = fitTo(s, max);
        expect(out.length).toBeLessThanOrEqual(max);
        if (s.trim().length <= max) expect(out).toBe(s.trim());
      }),
    );
  });
});

describe("checkIdeas with trimToFit", () => {
  it("accepts an idea that is too long only when the worker may cut it, and keeps every other rule", () => {
    const long = good([{ how: "First sentence. " + "Padding here. ".repeat(30) }]);
    expect(checkIdeas(long, kinds).reason).toBe("bad-text:too-long");
    const cut = checkIdeas(long, kinds, { trimToFit: true });
    expect(cut.reason).toBeNull();
    expect(cut.ideas?.[0].how.length).toBeLessThanOrEqual(LIMITS.how);
    // A claim of having run code is still rejected after the cut.
    const ran = good([{ how: "I ran the code and it passes. " + "Padding here. ".repeat(30) }]);
    expect(checkIdeas(ran, kinds, { trimToFit: true }).reason).toBe("bad-text:ran-claim");
    // A duplicate kind is still rejected.
    expect(checkIdeas(good([{}, { kind: kinds[0] }]), kinds, { trimToFit: true }).reason).toBe("duplicate-kind");
  });
});
describe("checkIdeas: the language that was asked for", () => {
  const ja = (over: Partial<Idea>[] = []) =>
    good([
      { how: "入力を半分に減らして、まだ失敗するか見る。", quickTest: "半分で失敗が続けば、その部分に原因がある。" },
      { how: "失敗した回と成功した回のログを並べる。", quickTest: "違う行が見つかれば、そこが手がかり。" },
      { how: "目的を一文で書き直す。", quickTest: "書けなければ、目的が決まっていない。" },
      { how: "公式ドキュメントでオプション名を確かめる。", quickTest: "名前が違えば、それが原因の候補。" },
      { how: "声に出して、誰かに説明する。", quickTest: "1分で言えなければ、整理が足りない。" },
    ]).map((x, i) => ({ ...x, ...(over[i] ?? {}) }));

  it("accepts Japanese ideas for Japanese, and English ideas for English", () => {
    expect(checkIdeas(ja(), kinds, { lang: "ja" }).reason).toBeNull();
    expect(checkIdeas(good(), kinds, { lang: "en" }).reason).toBeNull();
  });

  it("rejects English ideas when Japanese was asked for, and Japanese ideas when English was asked for", () => {
    expect(checkIdeas(good(), kinds, { lang: "ja" }).reason).toBe("wrong-language");
    expect(checkIdeas(ja(), kinds, { lang: "en" }).reason).toBe("wrong-language");
  });

  it("does not check the language when none is given", () => {
    expect(checkIdeas(good(), kinds).reason).toBeNull();
    expect(checkIdeas(ja(), kinds).reason).toBeNull();
  });

  it("counts a text as Japanese only when enough of it is Japanese", () => {
    expect(looksJapanese("入力を減らす")).toBe(true);
    expect(looksJapanese("Cut the input")).toBe(false);
    expect(looksJapanese("package.json を見る")).toBe(true);
    expect(looksJapanese("")).toBe(false);
  });
});