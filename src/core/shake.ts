import { fitTo, looksJapanese, textProblem, type TextProblem } from "./ideas";

/**
 * Three provocations for a person who is locked into one approach (see .kiro/specs/shake). They do not depend on the person's
 * problem. The rules check the shape and the claims a model cannot make, not whether a provocation helps.
 */
export interface Shake {
  title: string;
  /** One concrete action. */
  how: string;
  /** The time box, an integer from 1 to 10. */
  minutes: number;
}

export const SHAKE_COUNT = 3;
export const SHAKE_LIMITS = { title: 40, how: 140 } as const;
export const MIN_MINUTES = 1;
export const MAX_MINUTES = 10;

export type ShakeRejection =
  | "not-json"
  | "wrong-container"
  | "wrong-count"
  | "wrong-fields"
  | "bad-minutes"
  | `bad-text:${TextProblem}`
  | "duplicate-title"
  | "wrong-language";

function isMinutes(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v) && v >= MIN_MINUTES && v <= MAX_MINUTES;
}

/**
 * Accepts `{ moves: [...] }`, the array itself, or either as a JSON string. Returns the three provocations, trimmed, or the name
 * of the rule that rejected the answer. With `trimToFit` (the worker only) a text that is too long is cut at the end of a sentence first.
 */
export function checkShakes(
  raw: unknown,
  options: { trimToFit?: boolean; lang?: "en" | "ja" } = {},
): { shakes: Shake[] | null; reason: ShakeRejection | null } {
  const no = (reason: ShakeRejection) => ({ shakes: null, reason });
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
    if (keys.length !== 1 || keys[0] !== "moves") return no("wrong-container");
    value = (value as { moves: unknown }).moves;
  }
  if (!Array.isArray(value) || value.length !== SHAKE_COUNT) return no("wrong-count");
  const out: Shake[] = [];
  for (const item of value) {
    if (item === null || typeof item !== "object" || Array.isArray(item)) return no("wrong-fields");
    if (Object.keys(item).sort().join(",") !== "how,minutes,title") return no("wrong-fields");
    const f = item as Record<string, unknown>;
    const cut = (v: unknown, max: number): unknown => (options.trimToFit && typeof v === "string" ? fitTo(v, max) : v);
    const title = cut(f.title, SHAKE_LIMITS.title);
    const how = cut(f.how, SHAKE_LIMITS.how);
    if (!isMinutes(f.minutes)) return no("bad-minutes");
    const problem = textProblem(title, SHAKE_LIMITS.title) ?? textProblem(how, SHAKE_LIMITS.how);
    if (problem !== null) return no(`bad-text:${problem}`);
    if (typeof title !== "string" || typeof how !== "string") return no("bad-text:not-text");
    out.push({ title: title.trim(), how: how.trim(), minutes: f.minutes });
  }
  const titles = out.map((s) => s.title.toLowerCase());
  if (new Set(titles).size !== titles.length) return no("duplicate-title");
  if (options.lang === "ja" && !out.every((s) => looksJapanese(s.title) && looksJapanese(s.how))) return no("wrong-language");
  if (options.lang === "en" && out.some((s) => looksJapanese(s.title) || looksJapanese(s.how))) return no("wrong-language");
  return { shakes: out, reason: null };
}

/** One entry of the author's deck, in both languages. */
export interface DeckEntry {
  id: string;
  title: { en: string; ja: string };
  how: { en: string; ja: string };
  minutes: number;
}

/**
 * Draws `n` distinct entries with the given source of randomness (a function that returns a number from 0 up to, not including, 1).
 * The same sequence of random numbers gives the same draw. If the deck has fewer than `n`, all of it is returned.
 */
export function drawFromDeck(deck: readonly DeckEntry[], n: number, rand: () => number = Math.random): DeckEntry[] {
  const pool = [...deck];
  const take = Math.max(0, Math.min(n, pool.length));
  for (let i = 0; i < take; i++) {
    const j = i + Math.floor(rand() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, take);
}

export function deckToShakes(entries: readonly DeckEntry[], lang: "en" | "ja"): Shake[] {
  return entries.map((e) => ({ title: e.title[lang], how: e.how[lang], minutes: e.minutes }));
}
