import type { Lang } from "./types";

/**
 * What a language model is allowed to say about a typed sentence: two flags and nothing else.
 * null means "cannot tell". Anything outside this shape is rejected, so a wrong or attacked model can at most
 * mislabel one try, which the person sees and confirms before it touches a number (see .kiro/specs/reader-worker).
 */
export interface Reading {
  /** The try used a different approach from the one before. */
  newApproach: boolean | null;
  /** A new fact turned up (a log line, a measured value, a reproduction). */
  newFact: boolean | null;
}

const KEYS = ["newApproach", "newFact"] as const;

function isFlag(v: unknown): v is boolean | null {
  return v === true || v === false || v === null;
}

/**
 * Accepts a plain object with exactly the two keys, each true, false or null. A string is parsed as JSON first.
 * Returns null for everything else: extra keys, missing keys, wrong types, arrays, nested values.
 */
export function parseReading(raw: unknown): Reading | null {
  let value: unknown = raw;
  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) return null;
  const keys = Object.keys(value);
  if (keys.length !== KEYS.length || !KEYS.every((k) => keys.includes(k))) return null;
  const obj = value as Record<string, unknown>;
  if (!isFlag(obj.newApproach) || !isFlag(obj.newFact)) return null;
  return { newApproach: obj.newApproach, newFact: obj.newFact };
}

/** The sentence the shopkeeper shows before anything is added. It reflects the reading and asks; it does not claim to understand. */
export function describeReading(r: Reading, lang: Lang, isFirstTry = false): string {
  if (isFirstTry) {
    // With no earlier try there is nothing to differ from, so only the new-fact mark is reported.
    if (lang === "ja") {
      const fact = r.newFact === null ? "新しい事実が出たかは分からない" : r.newFact ? "新しい事実あり" : "新しい事実なし";
      return `最初の試みとして読みました: ${fact}。違っていたら、あとで画面で直せます。リストに足しますか？`;
    }
    const fact = r.newFact === null ? "I could not tell whether anything new turned up" : r.newFact ? "a new fact turned up" : "nothing new turned up";
    return `Read as your first try: ${fact}. You can fix it on the screen later. Add it to your list of tries?`;
  }
  if (lang === "ja") {
    const approach = r.newApproach === null ? "前と違うやり方かは分からない" : r.newApproach ? "前と違うやり方" : "前と同じやり方";
    const fact = r.newFact === null ? "新しい事実が出たかは分からない" : r.newFact ? "新しい事実あり" : "新しい事実なし";
    return `こう読みました: ${approach}、${fact}。違っていたら、あとで画面で直せます。リストに足しますか？`;
  }
  const approach =
    r.newApproach === null ? "I could not tell whether the approach changed" : r.newApproach ? "that try used a different approach" : "that try used the same approach as before";
  const fact =
    r.newFact === null ? "I could not tell whether anything new turned up" : r.newFact ? "a new fact turned up" : "nothing new turned up";
  const first = r.newApproach === null ? approach : `so ${approach}`;
  const sentences = [first, fact].map((s) => s.charAt(0).toUpperCase() + s.slice(1));
  return `${sentences.join(". ")}. Add it to your list of tries?`;
}
