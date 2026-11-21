/**
 * Five ideas for a person who is stuck, of different kinds, each with a quick test (see .kiro/specs/idea-burst).
 * The rules here check the shape, the spread of kinds, and a few claims a model cannot make. They do not check that an idea
 * is good: the quick test is how the person finds out. The page and the worker both call `parseIdeas`.
 */
export interface Idea {
  /** The id of an exit move, or "other". */
  kind: string;
  title: string;
  how: string;
  /** Something to do in about ten minutes, and what result would speak for or against the idea. */
  quickTest: string;
}

export const IDEA_COUNT = 5;
export const OTHER = "other";
export const LIMITS = { title: 60, how: 220, quickTest: 160 } as const;
export const MIN_MOVE_KINDS = 3;

/** Claims of having run or checked something, which a model that has no tool cannot truthfully make. */
const RAN_CLAIMS: RegExp[] = [
  /\bI(?:'ve| have)?\s+(?:ran|run|executed|tested|verified|checked|confirmed|reproduced)\b/i,
  /\b(?:ran|executed|tested|verified)\s+(?:the|your|this|it)\b.*\b(?:and|,)\s+(?:it|the test|the build)\s+(?:pass|work|succeed)/i,
  /実行して(?:確かめ|確認|試し|みました)/,
  /(?:動作|テスト)を?確認(?:しました|済み)/,
  /(?:試して|テストして)(?:みた|みました|確認)/,
];
const CODE_BLOCK = /```|~~~/;
const URL = /\bhttps?:\/\/|\bwww\./i;
const DISCLAIMER = /^\s*(?:as an ai\b|as a language model\b|i(?:'m| am) (?:just )?an ai\b|AI(?:として|なので))/i;

/** The name of the rule a text breaks, or null if it breaks none. The text itself is never part of the answer. */
export type TextProblem = "not-text" | "empty" | "too-long" | "code-block" | "url" | "disclaimer" | "ran-claim";

/**
 * Cuts a text that is too long down to the limit, at the last end of a sentence that fits, or else at the limit with an ellipsis.
 * It changes only the length. A model writes more than it is asked to, and throwing away an idea for that reason alone
 * loses the idea for a reason that has nothing to do with it. Every other rule still applies to the cut text.
 */
export function fitTo(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  const head = t.slice(0, max);
  const stops = [". ", "! ", "? ", "。", "！", "？", "; ", "；"];
  let cut = -1;
  for (const stop of stops) {
    const i = head.lastIndexOf(stop);
    if (i > cut) cut = i + (stop.length === 2 && stop.endsWith(" ") ? 1 : stop.length);
  }
  // Keep the cut only if it leaves a useful part (at least a third of the limit).
  if (cut >= Math.floor(max / 3)) return head.slice(0, cut).trim();
  return head.slice(0, max - 1).trimEnd() + "…";
}

export function textProblem(s: unknown, max: number): TextProblem | null {
  if (typeof s !== "string") return "not-text";
  const t = s.trim();
  if (t.length === 0) return "empty";
  if (t.length > max) return "too-long";
  if (CODE_BLOCK.test(t)) return "code-block";
  if (URL.test(t)) return "url";
  if (DISCLAIMER.test(t)) return "disclaimer";
  if (RAN_CLAIMS.some((re) => re.test(t))) return "ran-claim";
  return null;
}

/**
 * Accepts `{ ideas: [...] }`, the array itself, or either as a JSON string. Returns the five ideas, trimmed, or null.
 * Rejects the whole answer on any rule: see requirement 3 of the spec.
 */
export function parseIdeas(raw: unknown, allowedKinds: readonly string[]): Idea[] | null {
  return checkIdeas(raw, allowedKinds).ideas;
}

/** The same check, with the name of the rule that rejected the answer. The reason never contains the model's text. */
export type IdeasRejection =
  | "not-json"
  | "wrong-container"
  | "wrong-count"
  | "wrong-fields"
  | "unknown-kind"
  | `bad-text:${TextProblem}`
  | "duplicate-kind"
  | "too-few-move-kinds"
  | "duplicate-title"
  | "wrong-language";

/**
 * True when the text has at least two Japanese characters (kana or kanji). A Japanese sentence that names a file
 * ("package.json を見る") is mostly Latin letters, so a ratio would reject it. What the rule has to catch is an answer
 * written in English only, and that has no kana or kanji at all.
 */
export function looksJapanese(s: string): boolean {
  return (s.match(/[\u3040-\u30ff\u4e00-\u9fff]/g) ?? []).length >= 2;
}

export function checkIdeas(
  raw: unknown,
  allowedKinds: readonly string[],
  options: { trimToFit?: boolean; lang?: "en" | "ja" } = {},
): { ideas: Idea[] | null; reason: IdeasRejection | null } {
  const no = (reason: IdeasRejection) => ({ ideas: null, reason });
  let value: unknown = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return no("not-json");
    }
  }
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    const keys = Object.keys(value);
    if (keys.length !== 1 || keys[0] !== "ideas") return no("wrong-container");
    value = (value as { ideas: unknown }).ideas;
  }
  if (!Array.isArray(value) || value.length !== IDEA_COUNT) return no("wrong-count");
  const allowed = new Set(allowedKinds);
  const ideas: Idea[] = [];
  for (const item of value) {
    if (item === null || typeof item !== "object" || Array.isArray(item)) return no("wrong-fields");
    const keys = Object.keys(item).sort();
    if (keys.join(",") !== "how,kind,quickTest,title") return no("wrong-fields");
    const fields = item as Record<string, unknown>;
    const { kind } = fields;
    // The worker may cut a text that is too long (see fitTo). The page never does: it checks what it is given.
    const cut = (v: unknown, max: number): unknown => (options.trimToFit && typeof v === "string" ? fitTo(v, max) : v);
    const title = cut(fields.title, LIMITS.title);
    const how = cut(fields.how, LIMITS.how);
    const quickTest = cut(fields.quickTest, LIMITS.quickTest);
    if (typeof kind !== "string" || (kind !== OTHER && !allowed.has(kind))) return no("unknown-kind");
    const problem = textProblem(title, LIMITS.title) ?? textProblem(how, LIMITS.how) ?? textProblem(quickTest, LIMITS.quickTest);
    if (problem !== null) return no(`bad-text:${problem}`);
    // textProblem returned null, so all three are strings. This narrows them for the compiler.
    if (typeof title !== "string" || typeof how !== "string" || typeof quickTest !== "string") return no("bad-text:not-text");
    ideas.push({ kind, title: title.trim(), how: how.trim(), quickTest: quickTest.trim() });
  }
  const kinds = ideas.map((i) => i.kind);
  if (new Set(kinds).size !== kinds.length) return no("duplicate-kind");
  if (kinds.filter((k) => k !== OTHER).length < MIN_MOVE_KINDS) return no("too-few-move-kinds");
  const titles = ideas.map((i) => i.title.toLowerCase());
  if (new Set(titles).size !== titles.length) return no("duplicate-title");
  // The model may answer in another language than the one asked for. Then no idea is shown.
  if (options.lang === "ja" && !ideas.every((i) => looksJapanese(i.how) && looksJapanese(i.quickTest))) return no("wrong-language");
  if (options.lang === "en" && ideas.some((i) => looksJapanese(i.how) || looksJapanese(i.quickTest))) return no("wrong-language");
  return { ideas, reason: null };
}

export interface KindLabel {
  /** What the page shows for the kind. */
  kind: "sourced" | "rule-of-thumb" | "other";
  /** The title of the move, when the kind is a move. */
  moveTitle?: { en: string; ja: string };
  /** The source text of the move, when it names one. */
  source?: { en: string; ja: string };
}

/** Label for an idea: a move that names a source, a rule-of-thumb move, or the model's own idea. `isSourced` decides. */
export function labelOf(
  idea: Idea,
  solutions: readonly { id: string; title: { en: string; ja: string }; source?: { en: string; ja: string } }[],
  isSourced: (s: { en: string; ja: string } | undefined) => boolean,
): KindLabel {
  if (idea.kind === OTHER) return { kind: "other" };
  const move = solutions.find((s) => s.id === idea.kind);
  if (!move) return { kind: "other" };
  return isSourced(move.source)
    ? { kind: "sourced", moveTitle: move.title, source: move.source }
    : { kind: "rule-of-thumb", moveTitle: move.title };
}
