/**
 * The antlion pit: effort that makes things worse. After repeated failures of the same approach, the
 * odds that the next try with that approach works go down, so a fresh approach becomes the better bet.
 *
 * Two types of task: easy (`pe` chance per try) and hard (`ph` chance per try). Failures are evidence for
 * the hard type. This is the smallest model with heavy-tailed run times, where a restart beats waiting
 * (Gomes, Selman and Crato 1997; Luby, Sinclair and Zuckerman 1993).
 * Time already spent is not an input, so the sunk-cost effect cannot enter (Staw 1976; Arkes and Blumer 1985).
 *
 * All numbers in PIT_PARAMS are authored by hand, not measured. See docs/assumptions.md.
 */

export interface PitParams {
  /** Success chance per try if the task is the easy type. */
  pe: number;
  /** Success chance per try if the task is the hard type. */
  ph: number;
  /** Prior weight of the hard type. */
  w0: number;
  /** Success chance of a fresh approach (a restart, a smaller problem). */
  pSwitch: number;
}

export const PIT_PARAMS: PitParams = { pe: 0.5, ph: 0.04, w0: 0.4, pSwitch: 0.2 };

export interface Attempt {
  /** True when the try used a different approach from the one before. */
  newApproach: boolean;
}

/** Same-approach failures since the last new approach. A try that is a new approach starts a new run. */
export function failuresInRun(attempts: readonly Attempt[]): number {
  let k = 0;
  for (const a of attempts) k = a.newApproach ? 0 : k + 1;
  return k;
}

/** Probability that the task is the hard type after k failures of the same approach. */
export function pHard(k: number, p: PitParams = PIT_PARAMS): number {
  const h = p.w0 * Math.pow(1 - p.ph, k);
  const e = (1 - p.w0) * Math.pow(1 - p.pe, k);
  return h / (h + e);
}

/** Probability that the next try with the same approach succeeds, after k failures of it. */
export function pNext(k: number, p: PitParams = PIT_PARAMS): number {
  const w = pHard(k, p);
  return w * p.ph + (1 - w) * p.pe;
}

export type PitVerdict = "persist" | "switch";

export interface PitReport {
  failuresInRun: number;
  pHard: number;
  pNext: number;
  pSwitch: number;
  verdict: PitVerdict;
}

export function pitCheck(attempts: readonly Attempt[], p: PitParams = PIT_PARAMS): PitReport {
  const k = failuresInRun(attempts);
  const next = pNext(k, p);
  return {
    failuresInRun: k,
    pHard: pHard(k, p),
    pNext: next,
    pSwitch: p.pSwitch,
    verdict: next < p.pSwitch ? "switch" : "persist",
  };
}

/** The smallest number of same-approach failures after which the verdict becomes "switch", or null. */
export function switchPoint(p: PitParams = PIT_PARAMS, maxK = 200): number | null {
  for (let k = 0; k <= maxK; k++) if (pNext(k, p) < p.pSwitch) return k;
  return null;
}
