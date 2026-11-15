export type Lang = "ja" | "en";

export interface L10n {
  ja: string;
  en: string;
}

/** An underlying need (the situation that actually hurts), not a solution. */
export interface Need {
  id: string;
  title: L10n;
  gloss: L10n;
}

/**
 * A yes/no style probe about a concrete past episode.
 * `yes[needId]` is how strongly the attribute holds for that need, in [0, 1].
 * Needs not listed use `base`.
 */
export interface Question {
  id: string;
  text: L10n;
  cost: number;
  base: number;
  yes: Record<string, number>;
}

/** A thing that could be built. `fit[needId]` in [0, 1] is how well it serves that need. */
export interface Solution {
  id: string;
  title: L10n;
  pitch: L10n;
  cost: L10n;
  fit: Record<string, number>;
  /** EARS-style requirements emitted into the spec. */
  requirements: L10n[];
}

export interface KnowledgeBase {
  needs: Need[];
  questions: Question[];
  solutions: Solution[];
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
}

export const DEFAULT_PARAMS: ModelParams = {
  sigma: 0.25,
  unknown: 0.1,
  mention: 0.3,
};
