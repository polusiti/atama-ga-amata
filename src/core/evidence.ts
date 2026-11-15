import { needWords, solutionAliases, wantMarkers } from "./lexicon";
import { normalize } from "./normalize";
import type { KnowledgeBase } from "./types";

/** Each matched point of keyword weight multiplies the odds for that need by this much, up to MAX_POINTS. */
export const POINT_GAIN = 0.8;
/** Evidence from one sentence is bounded: no need can gain more than 1 + POINT_GAIN * MAX_POINTS in likelihood. */
export const MAX_POINTS = 4;

export interface Reading {
  /** Per need, aligned with kb.needs. All 1 when nothing matched. Always >= 1 and bounded. */
  likelihood: number[];
  /** Matched keyword points per need. */
  points: number[];
  /** The need with the strictly highest points, or null if none matched or two are tied. */
  top: string | null;
  /** A solution the user said they want, or null. */
  named: string | null;
}

const normalizedWords = new Map<string, { word: string; weight: number }[]>();
function wordsFor(needId: string) {
  let list = normalizedWords.get(needId);
  if (!list) {
    list = (needWords[needId] ?? []).map(([w, weight]) => ({ word: normalize(w), weight }));
    normalizedWords.set(needId, list);
  }
  return list;
}

/** Read free text: keyword evidence about the need and a named solution if "I want X" is present. */
export function readText(kb: KnowledgeBase, text: string): Reading {
  const s = normalize(text);
  const points = kb.needs.map((need) => {
    let p = 0;
    const seen = new Set<string>();
    for (const { word, weight } of wordsFor(need.id)) {
      if (word && !seen.has(word) && s.includes(word)) {
        seen.add(word);
        p += weight;
      }
    }
    return Math.min(p, MAX_POINTS);
  });
  const likelihood = points.map((p) => 1 + POINT_GAIN * p);

  const best = Math.max(...points);
  const leaders = points.filter((p) => p === best).length;
  const top = best > 0 && leaders === 1 ? kb.needs[points.indexOf(best)].id : null;

  let named: string | null = null;
  if (wantMarkers.some((m) => s.includes(normalize(m)))) {
    for (const solution of kb.solutions) {
      const aliases = solutionAliases[solution.id] ?? [];
      if (aliases.some((a) => s.includes(normalize(a)))) {
        named = solution.id;
        break;
      }
    }
  }
  return { likelihood, points, top, named };
}
