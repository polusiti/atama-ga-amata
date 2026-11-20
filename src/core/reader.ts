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
export function describeReading(r: Reading, lang: Lang): string {
  const approach =
    r.newApproach === null
      ? lang === "ja"
        ? "やり方が前と違うかは、読み取れませんでした"
        : "I could not tell whether the approach differed"
      : r.newApproach
        ? lang === "ja"
          ? "前とは違うやり方"
          : "a different approach"
        : lang === "ja"
          ? "前と同じやり方"
          : "the same approach";
  const fact =
    r.newFact === null
      ? lang === "ja"
        ? "新しい事実が出たかは、読み取れませんでした"
        : "I could not tell whether a new fact turned up"
      : r.newFact
        ? lang === "ja"
          ? "新しい事実あり"
          : "a new fact"
        : lang === "ja"
          ? "新しい事実なし"
          : "no new fact";
  return lang === "ja"
    ? `こう読みました: ${approach}、${fact}。この内容で、うまくいかなかった試みとして足しますか？`
    : `I read this as: ${approach}; ${fact}. Add it as a try that did not work?`;
}
