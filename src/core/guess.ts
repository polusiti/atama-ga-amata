/**
 * Guess and confirm, after Akinator: the engine makes a guess, the person says whether it matches.
 * Pure functions. Verdicts are the person's own judgement, so they measure "felt right", not "was the cause".
 */

/** A rejected need is lowered, never removed: a person can misjudge their own stall. Hand-chosen. */
export const REJECT_FACTOR = 0.05;
export const MAX_GUESSES = 2;

export function applyRejections(belief: readonly number[], rejected: readonly number[]): number[] {
  const scaled = belief.map((p, i) => (rejected.includes(i) ? p * REJECT_FACTOR : p));
  const sum = scaled.reduce((a, b) => a + b, 0);
  return sum > 0 ? scaled.map((p) => p / sum) : scaled.map(() => 1 / scaled.length);
}

export function pickGuess(
  belief: readonly number[],
  rejected: readonly number[],
): { index: number; probability: number } | null {
  let best = -1;
  for (let i = 0; i < belief.length; i++) {
    if (rejected.includes(i)) continue;
    if (best < 0 || belief[i] > belief[best]) best = i;
  }
  return best < 0 ? null : { index: best, probability: belief[best] };
}

export type Verdict = "right" | "wrong" | "unsure";

export interface GuessRecord {
  pack: string;
  answers: number;
  guesses: { need: string; probability: number }[];
  verdict: Verdict;
  /** Need the person chose as closest, "none" for none of these, or null when not asked. */
  actual: string | null;
}

/** 95% Wilson score interval for k successes in n trials. n = 0 gives [0, 1]. */
export function wilson(k: number, n: number, z = 1.96): [number, number] {
  if (n <= 0) return [0, 1];
  const p = k / n;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const centre = (p + z2 / (2 * n)) / denom;
  const half = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / denom;
  return [Math.max(0, centre - half), Math.min(1, centre + half)];
}

export interface Summary {
  rounds: number;
  right: number;
  wrong: number;
  unsure: number;
  /** Match rate among rounds with a right or wrong verdict. null when there are none. */
  rate: number | null;
  interval: [number, number];
  /** Mean probability the engine gave its first guess, over decided rounds. null when none. */
  meanFirstProbability: number | null;
}

export function summarize(records: readonly GuessRecord[]): Summary {
  const right = records.filter((r) => r.verdict === "right").length;
  const wrong = records.filter((r) => r.verdict === "wrong").length;
  const unsure = records.length - right - wrong;
  const decided = records.filter((r) => r.verdict !== "unsure" && r.guesses.length > 0);
  const n = right + wrong;
  return {
    rounds: records.length,
    right,
    wrong,
    unsure,
    rate: n > 0 ? right / n : null,
    interval: wilson(right, n),
    meanFirstProbability:
      decided.length > 0 ? decided.reduce((s, r) => s + r.guesses[0].probability, 0) / decided.length : null,
  };
}

export function exportRecords(records: readonly GuessRecord[]): string {
  return JSON.stringify(
    {
      schema: "atamagazon-guess-records/1",
      note: "Verdicts are the person's own judgement. No free text is included.",
      records: records.map((r) => ({
        ...r,
        guesses: r.guesses.map((g) => ({ need: g.need, probability: Math.round(g.probability * 1000) / 1000 })),
      })),
    },
    null,
    2,
  );
}
