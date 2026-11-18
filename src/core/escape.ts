import { rankSolutions } from "./engine";
import type { KnowledgeBase, Solution } from "./types";

/**
 * Exit moves for the antlion pit. A person who is already stuck should not be handed an untested move as if it
 * were a tested one, so only moves that name a source come first.
 */
const ROUGH_LABELS = ["rule of thumb", "経験則"];
/** A citation: an author or a title with a four-digit year, such as "Laban et al. 2025" or "Zeller 2009". */
const CITATION = /\b(19|20)\d{2}\b/;
/** Named works without a year in the data. Kept short and explicit: each is a book or a method with an author. */
const NAMED_WORKS = ["Zeller"];

export function isSourced(source: { en: string; ja: string } | undefined): boolean {
  const text = (source?.en ?? "").trim();
  if (text === "") return false;
  if (NAMED_WORKS.some((w) => text.includes(w))) return true;
  if (CITATION.test(text)) return true;
  const lower = text.toLowerCase();
  return !ROUGH_LABELS.some((l) => lower.includes(l.toLowerCase()));
}

export interface ExitMove {
  solution: Solution;
  score: number;
  sourced: boolean;
}

/**
 * Up to n moves that name a source, ranked by the expected fit under the belief. If none names a source, the list is empty:
 * the caller must say so and must not present a rule of thumb as a sourced move.
 */
export function exitMoves(kb: KnowledgeBase, belief: readonly number[], n = 3): ExitMove[] {
  return rankSolutions(belief, kb)
    .filter((r) => isSourced(r.solution.source))
    .slice(0, Math.max(0, n))
    .map((r) => ({ solution: r.solution, score: r.score, sourced: true }));
}

/** Moves that carry only the rule-of-thumb label, ranked the same way. Shown after the sourced ones, labelled. */
export function roughMoves(kb: KnowledgeBase, belief: readonly number[], n = 3): ExitMove[] {
  return rankSolutions(belief, kb)
    .filter((r) => !isSourced(r.solution.source))
    .slice(0, Math.max(0, n))
    .map((r) => ({ solution: r.solution, score: r.score, sourced: false }));
}
