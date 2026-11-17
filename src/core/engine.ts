import { entropy, fisherRao, normalize, uniform } from "./math";
import {
  ANSWERS,
  DEFAULT_PARAMS,
  type Answer,
  type KnowledgeBase,
  type ModelParams,
  type Question,
  type Solution,
} from "./types";

/** Where each non-"unknown" answer sits on the [0, 1] truth scale. */
const CENTERS: Record<Exclude<Answer, "unknown">, number> = {
  yes: 1,
  probably: 0.75,
  probablyNot: 0.25,
  no: 0,
};

/**
 * P(answer | attribute strength v). A fixed share goes to "unknown"; the rest is split
 * among the four graded answers by a Gaussian kernel around each answer's center.
 * Always sums to 1 over ANSWERS.
 */
export function answerDistribution(v: number, params: ModelParams = DEFAULT_PARAMS): number[] {
  const { sigma, unknown } = params;
  const graded = (Object.keys(CENTERS) as (keyof typeof CENTERS)[]).map((a) =>
    Math.exp(-((v - CENTERS[a]) ** 2) / (2 * sigma * sigma)),
  );
  const gs = graded.reduce((a, b) => a + b, 0);
  const share = (1 - unknown) / gs;
  const byAnswer: Record<Answer, number> = {
    yes: graded[0] * share,
    probably: graded[1] * share,
    probablyNot: graded[2] * share,
    no: graded[3] * share,
    unknown,
  };
  // A share of answers is random whatever the truth. It bounds the evidence any one answer can give.
  const lapse = params.lapse;
  return ANSWERS.map((a) => (1 - lapse) * byAnswer[a] + lapse / ANSWERS.length);
}

export function strength(q: Question, needId: string): number {
  return q.yes[needId] ?? q.base;
}

/**
 * Prior belief over needs. With no stated solution it is uniform.
 * A stated solution is treated as noisy evidence: P(name Y | need) = mention + (1 - mention) * fit(need, Y).
 */
export function priorFromStated(
  kb: KnowledgeBase,
  statedSolutionId: string | null,
  params: ModelParams = DEFAULT_PARAMS,
): number[] {
  const n = kb.needs.length;
  if (!statedSolutionId) return uniform(n);
  const sol = kb.solutions.find((s) => s.id === statedSolutionId);
  if (!sol) return uniform(n);
  return normalize(
    kb.needs.map((need) => params.mention + (1 - params.mention) * (sol.fit[need.id] ?? 0)),
  );
}

/** Bayes update of the belief after one answer. */
export function updateBelief(
  belief: readonly number[],
  kb: KnowledgeBase,
  question: Question,
  answer: Answer,
  params: ModelParams = DEFAULT_PARAMS,
): number[] {
  const ai = ANSWERS.indexOf(answer);
  const weights = kb.needs.map(
    (need, i) => belief[i] * answerDistribution(strength(question, need.id), params)[ai],
  );
  return normalize(weights);
}

export interface AnswerEntry {
  qid: string;
  answer: Answer;
}

/**
 * Belief after a list of answers, always rebuilt from the prior.
 * Deriving the belief this way makes undo exact: dropping entries gives the earlier belief.
 */
export function replayBelief(
  kb: KnowledgeBase,
  statedSolutionId: string | null,
  entries: readonly AnswerEntry[],
  params: ModelParams = DEFAULT_PARAMS,
  /** Likelihood vectors from free-text notes, aligned with kb.needs. Multiplication commutes, so order does not matter. */
  notes: readonly (readonly number[])[] = [],
): number[] {
  let belief = priorFromStated(kb, statedSolutionId, params);
  for (const note of notes) {
    belief = normalize(belief.map((b, i) => b * (note[i] ?? 1)));
  }
  for (const entry of entries) {
    const question = kb.questions.find((q) => q.id === entry.qid);
    if (question) belief = updateBelief(belief, kb, question, entry.answer, params);
  }
  return belief;
}

/** Mutual information (nats) between the hidden need and the answer to `question`. Exact. */
export function expectedInformationGain(
  belief: readonly number[],
  kb: KnowledgeBase,
  question: Question,
  params: ModelParams = DEFAULT_PARAMS,
): number {
  const marginal = new Array<number>(ANSWERS.length).fill(0);
  let conditional = 0;
  kb.needs.forEach((need, i) => {
    const dist = answerDistribution(strength(question, need.id), params);
    dist.forEach((p, a) => {
      marginal[a] += belief[i] * p;
    });
    conditional += belief[i] * entropy(dist);
  });
  return Math.max(0, entropy(marginal) - conditional);
}

export interface NextQuestion {
  question: Question;
  gain: number;
  score: number;
}

/** Pick the unasked question with the best information gain per unit of user effort. */
export function chooseNextQuestion(
  belief: readonly number[],
  kb: KnowledgeBase,
  askedIds: readonly string[],
  params: ModelParams = DEFAULT_PARAMS,
): NextQuestion | null {
  let best: NextQuestion | null = null;
  for (const q of kb.questions) {
    if (askedIds.includes(q.id)) continue;
    const gain = expectedInformationGain(belief, kb, q, params);
    const score = gain / q.cost;
    if (best === null || score > best.score + 1e-12) best = { question: q, gain, score };
  }
  return best;
}

export interface StopRule {
  maxQuestions: number;
  /** No confident conclusion before this many answers, however sharp they look. */
  minQuestions: number;
  confidence: number;
  /** Stop when the best remaining question is worth less than this many nats per unit cost. */
  minScore: number;
}

export const DEFAULT_STOP: StopRule = { maxQuestions: 8, minQuestions: 4, confidence: 0.85, minScore: 0.05 };

export type StopReason = "confident" | "budget" | "low-value" | "exhausted";

export function shouldStop(
  belief: readonly number[],
  kb: KnowledgeBase,
  askedIds: readonly string[],
  params: ModelParams = DEFAULT_PARAMS,
  rule: StopRule = DEFAULT_STOP,
): StopReason | null {
  if (askedIds.length >= rule.minQuestions && Math.max(...belief) >= rule.confidence) return "confident";
  if (askedIds.length >= rule.maxQuestions) return "budget";
  const next = chooseNextQuestion(belief, kb, askedIds, params);
  if (next === null) return "exhausted";
  if (next.score < rule.minScore) return "low-value";
  return null;
}

export interface RankedSolution {
  solution: Solution;
  /** Expected fit under the current belief, in [0, 1]. */
  score: number;
}

export function rankSolutions(belief: readonly number[], kb: KnowledgeBase): RankedSolution[] {
  return kb.solutions
    .map((solution) => ({
      solution,
      score: kb.needs.reduce((acc, need, i) => acc + belief[i] * (solution.fit[need.id] ?? 0), 0),
    }))
    .sort((a, b) => b.score - a.score);
}

export interface FitChange {
  solution: Solution;
  before: number;
  after: number;
  /** after - before, in [-1, 1]. */
  delta: number;
}

/** Solutions whose expected fit moved the most between two beliefs, largest absolute change first. */
export function fitChanges(
  kb: KnowledgeBase,
  before: readonly number[],
  after: readonly number[],
): FitChange[] {
  const b = new Map(rankSolutions(before, kb).map((r) => [r.solution.id, r.score]));
  return rankSolutions(after, kb)
    .map(({ solution, score }) => {
      const prev = b.get(solution.id) ?? 0;
      return { solution, before: prev, after: score, delta: score - prev };
    })
    .sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta));
}

/**
 * How far the need implied by the user's own stated solution is from the need we now infer,
 * on the Fisher-Rao scale [0, pi]. Large = the stated solution probably misses the real need.
 */
export function statedGap(
  kb: KnowledgeBase,
  statedSolutionId: string | null,
  belief: readonly number[],
  params: ModelParams = DEFAULT_PARAMS,
): number | null {
  if (!statedSolutionId) return null;
  return fisherRao(priorFromStated(kb, statedSolutionId, params), belief);
}


