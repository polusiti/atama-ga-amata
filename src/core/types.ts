export type Lang = "ja" | "en";

export interface L10n {
  ja: string;
  en: string;
}

/** An underlying need (the situation that actually hurts), not a solution. */
export interface Need {
  id: string;
  /** "self": a stall the person can check with their own hands (a gap, an assumption, a target, wear). */
  side?: "self";
  short: L10n;
  title: L10n;
  gloss: L10n;
}

/**
 * A probe about a concrete practice or a concrete past episode.
 * `yes[needId]` is how strongly a "yes" holds for that need, in [0, 1].
 * Needs not listed use `base`.
 */
export interface Question {
  id: string;
  text: L10n;
  cost: number;
  base: number;
  yes: Record<string, number>;
  /**
   * If set, a "yes" or "probably" means this step (a solution id) is already in place.
   * Used by problem-solving packs to avoid advising what the person already does.
   */
  practice?: string;
}

/** A thing that could be built or done. `fit[needId]` in [0, 1] is how well it serves that need. */
export interface Solution {
  id: string;
  title: L10n;
  pitch: L10n;
  cost: L10n;
  fit: Record<string, number>;
  /** Steps or EARS-style requirements emitted into the output. */
  requirements: L10n[];
  /** Solution ids that should be in place first. Must be acyclic. */
  requires?: string[];
  /** Where the idea comes from, or "rule of thumb, not tested". */
  source?: L10n;
}

export interface KnowledgeBase {
  needs: Need[];
  questions: Question[];
  solutions: Solution[];
}

export type Weighted = readonly [word: string, weight: 1 | 2];

/** Keywords for reading free text. Each pack has its own. */
export interface Lexicon {
  needWords: Record<string, readonly Weighted[]>;
  solutionAliases: Record<string, readonly string[]>;
  wantMarkers: readonly string[];
}

export const ANSWERS = ["yes", "probably", "unknown", "probablyNot", "no"] as const;
export type Answer = (typeof ANSWERS)[number];

export interface ModelParams {
  /** Std-dev of the answer noise around the expected answer. Larger = noisier users. */
  sigma: number;
  /** Probability that the user answers "don't know" regardless of the truth. */
  unknown: number;
  /** Baseline probability that a user names a solution regardless of their real need (solution fixation). */
  mention: number;
  /**
   * Share of answers that are random whatever the truth (slips, lucky guesses, agreeing to everything).
   * It bounds how much a single answer can move the belief.
   */
  lapse: number;
}

export const DEFAULT_PARAMS: ModelParams = {
  sigma: 0.25,
  unknown: 0.1,
  mention: 0.3,
  lapse: 0.1,
};
