import {
  answerDistribution,
  expectedInformationGain,
  priorFromStated,
  strength,
  updateBelief,
  type AnswerEntry,
} from "./engine";
import { normalize } from "./math";
import { ANSWERS, DEFAULT_PARAMS, type Answer, type KnowledgeBase, type ModelParams, type Question } from "./types";

/**
 * MYCIN-style explanation facility, answered from our own engine.
 * WHY: why is this question being asked? HOW: why does the system believe what it believes?
 */

export interface WhyOutcome {
  answer: Answer;
  /** Probability of getting this answer under the current belief. Sums to 1 over all answers. */
  probability: number;
  topNeedId: string;
  topProbability: number;
}

export interface Why {
  question: Question;
  /** Expected information gain in nats. */
  gain: number;
  cost: number;
  /** Up to three leading needs, with how strongly a "yes" holds for each (the rule's strength). */
  leaders: { needId: string; probability: number; strength: number }[];
  outcomes: WhyOutcome[];
}

export function explainWhy(
  kb: KnowledgeBase,
  belief: readonly number[],
  question: Question,
  params: ModelParams = DEFAULT_PARAMS,
): Why {
  const leaders = kb.needs
    .map((need, i) => ({ needId: need.id, probability: belief[i], strength: strength(question, need.id) }))
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3);

  const outcomes: WhyOutcome[] = ANSWERS.map((answer, ai) => {
    const probability = kb.needs.reduce(
      (acc, need, i) => acc + belief[i] * answerDistribution(strength(question, need.id), params)[ai],
      0,
    );
    const after = updateBelief(belief, kb, question, answer, params);
    const top = after.indexOf(Math.max(...after));
    return { answer, probability, topNeedId: kb.needs[top].id, topProbability: after[top] };
  });

  return {
    question,
    gain: expectedInformationGain(belief, kb, question, params),
    cost: question.cost,
    leaders,
    outcomes,
  };
}

export type EvidenceKind = "stated" | "note" | "answer";

export interface TraceStep {
  kind: EvidenceKind;
  /** Index into the notes or the answers. 0 for the stated solution. */
  index: number;
  /** Belief after applying this piece of evidence. */
  after: number[];
}

export interface Trace {
  /** Belief before any evidence: uniform. */
  start: number[];
  steps: TraceStep[];
}

/**
 * Replays the belief one piece of evidence at a time, in the same order as `replayBelief`:
 * stated solution, then free-text notes, then answers.
 */
export function traceBelief(
  kb: KnowledgeBase,
  statedSolutionId: string | null,
  entries: readonly AnswerEntry[],
  params: ModelParams = DEFAULT_PARAMS,
  notes: readonly (readonly number[])[] = [],
): Trace {
  const n = kb.needs.length;
  const start = new Array<number>(n).fill(1 / n);
  const steps: TraceStep[] = [];
  let belief = start;

  if (statedSolutionId !== null) {
    belief = priorFromStated(kb, statedSolutionId, params);
    steps.push({ kind: "stated", index: 0, after: belief });
  }
  notes.forEach((note, index) => {
    belief = normalize(belief.map((b, i) => b * (note[i] ?? 1)));
    steps.push({ kind: "note", index, after: belief });
  });
  entries.forEach((entry, index) => {
    const question = kb.questions.find((q) => q.id === entry.qid);
    if (!question) return;
    belief = updateBelief(belief, kb, question, entry.answer, params);
    steps.push({ kind: "answer", index, after: belief });
  });
  return { start, steps };
}

export interface Contribution {
  kind: EvidenceKind;
  index: number;
  /** Multiplier on the odds of the need caused by this evidence: after / before. Above 1 supports it. */
  factor: number;
}

/** How much each piece of evidence moved one need. The product of all factors is final / start. */
export function contributions(trace: Trace, needIndex: number): Contribution[] {
  let before = trace.start[needIndex];
  return trace.steps.map((step) => {
    const after = step.after[needIndex];
    const factor = before > 0 ? after / before : 1;
    before = after;
    return { kind: step.kind, index: step.index, factor };
  });
}

