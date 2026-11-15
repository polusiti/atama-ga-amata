import { needWords, solutionAliases } from "./lexicon";
import { DEFAULT_PARAMS, type KnowledgeBase } from "./types";

/**
 * How many numbers in this store were set by hand rather than computed.
 * Counted from the data itself so the figure on the About page cannot drift from the code.
 */
export interface Authored {
  /** Per-question strengths: one base value plus one entry per need that differs from it. */
  questionStrengths: number;
  /** Solution-to-need fit values. */
  solutionFits: number;
  /** Model parameters: noise, "don't know" share, solution fixation. */
  modelParameters: number;
  /** Keyword weights in the lexicon. */
  keywordWeights: number;
  /** Words that name a solution. */
  solutionAliases: number;
  total: number;
}

export function countAuthored(kb: KnowledgeBase): Authored {
  const questionStrengths = kb.questions.reduce((acc, q) => acc + 1 + Object.keys(q.yes).length, 0);
  const solutionFits = kb.solutions.reduce((acc, s) => acc + Object.keys(s.fit).length, 0);
  const modelParameters = Object.keys(DEFAULT_PARAMS).length;
  const keywordWeights = Object.values(needWords).reduce((acc, list) => acc + list.length, 0);
  const aliases = Object.values(solutionAliases).reduce((acc, list) => acc + list.length, 0);
  return {
    questionStrengths,
    solutionFits,
    modelParameters,
    keywordWeights,
    solutionAliases: aliases,
    total: questionStrengths + solutionFits + modelParameters + keywordWeights + aliases,
  };
}
