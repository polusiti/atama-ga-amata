/**
 * Fit: does the person's level reach what the plan needs? A teacher finds the level first.
 *
 * Ability theta lives on a grid. Each graded item has a difficulty b. The chance of a correct answer is
 * c + (1 - c) * sigmoid(theta - b): a Rasch model with a floor c for guessing (c = 0.25 for four options).
 * This is the model behind adaptive testing, which stops when it is sure on which side of the pass mark
 * the person is.
 *
 * The item difficulties and the requirement levels are authored by hand, not calibrated on real answers.
 * A band is the model's reading of the numbers, not a prediction of the outcome.
 */

export const GRID_MIN = -3;
export const GRID_MAX = 3;
export const GRID_N = 121;
export const GUESS_FLOOR = 0.25;

export const GRID: readonly number[] = Array.from(
  { length: GRID_N },
  (_, i) => GRID_MIN + ((GRID_MAX - GRID_MIN) * i) / (GRID_N - 1),
);

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

export interface Item {
  id: string;
  /** Difficulty on the same scale as ability. */
  b: number;
}

export interface Response {
  itemId: string;
  correct: boolean;
}

export function pCorrect(theta: number, b: number, c: number = GUESS_FLOOR): number {
  return c + (1 - c) * sigmoid(theta - b);
}

function normalize(w: number[]): number[] {
  const s = w.reduce((a, x) => a + x, 0);
  return s > 0 ? w.map((x) => x / s) : w.map(() => 1 / w.length);
}

/** Standard normal prior on the grid. */
export function priorPosterior(): number[] {
  return normalize(GRID.map((t) => Math.exp(-0.5 * t * t)));
}

/** Posterior over theta after the responses. The product commutes, so the order does not matter. */
export function posterior(items: readonly Item[], responses: readonly Response[]): number[] {
  const byId = new Map(items.map((i) => [i.id, i]));
  let w = priorPosterior();
  for (const r of responses) {
    const item = byId.get(r.itemId);
    if (!item) throw new Error(`unknown item ${r.itemId}`);
    w = normalize(w.map((p, k) => p * (r.correct ? pCorrect(GRID[k], item.b) : 1 - pCorrect(GRID[k], item.b))));
  }
  return w;
}

/** P(theta >= R). */
export function fitProbability(post: readonly number[], R: number): number {
  let s = 0;
  for (let k = 0; k < GRID.length; k++) if (GRID[k] >= R) s += post[k];
  return Math.min(1, Math.max(0, s));
}

/** Central interval holding the given share of the posterior mass. */
export function interval(post: readonly number[], share = 0.8): [number, number] {
  const lo = (1 - share) / 2;
  const hi = 1 - lo;
  let c = 0;
  let a = GRID[0];
  let b = GRID[GRID.length - 1];
  let gotA = false;
  for (let k = 0; k < GRID.length; k++) {
    c += post[k];
    if (!gotA && c >= lo) { a = GRID[k]; gotA = true; }
    if (c >= hi) { b = GRID[k]; break; }
  }
  return [a, b];
}

export type Band = "fit" | "stretch" | "mismatch";
export const FIT_AT = 0.8;
export const MISMATCH_AT = 0.2;

export function bandOf(p: number): Band {
  return p >= FIT_AT ? "fit" : p <= MISMATCH_AT ? "mismatch" : "stretch";
}

export interface Requirement {
  /** Level the plan asks for, on the ability scale. */
  level: number;
  /** Where the level comes from. Without a source, no band is given. */
  source?: string;
}

export type FitResult =
  | { kind: "no-reference"; reason: string }
  | { kind: "cannot-measure"; reason: string }
  | { kind: "band"; band: Band; p: number; thetaInterval: [number, number]; source: string };

/** How far from the level an item must be to count as clearly easier or clearly harder. */
export const COVER_GAP = 1;
/** How many items are needed on each side of the level. */
export const COVER_MIN = 2;

export interface Coverage {
  easier: number;
  harder: number;
  covered: boolean;
}

/** A measure cannot be better than its items: the bank must reach both sides of the level. */
export function coverage(items: readonly Item[], R: number): Coverage {
  const easier = items.filter((i) => i.b <= R - COVER_GAP).length;
  const harder = items.filter((i) => i.b >= R + COVER_GAP).length;
  return { easier, harder, covered: easier >= COVER_MIN && harder >= COVER_MIN };
}

export function fitCheck(post: readonly number[], req: Requirement, items?: readonly Item[]): FitResult {
  if (!req.source || req.source.trim() === "") {
    return { kind: "no-reference", reason: "The plan names no source for the level it needs, so no judgement is made." };
  }
  if (items) {
    const c = coverage(items, req.level);
    if (!c.covered) {
      return {
        kind: "cannot-measure",
        reason: `The items cannot separate people near this level: ${c.easier} clearly easier and ${c.harder} clearly harder items, and ${COVER_MIN} of each are needed.`,
      };
    }
  }
  const p = fitProbability(post, req.level);
  return { kind: "band", band: bandOf(p), p, thetaInterval: interval(post), source: req.source };
}

function binaryEntropy(p: number): number {
  if (p <= 0 || p >= 1) return 0;
  return -(p * Math.log(p) + (1 - p) * Math.log(1 - p));
}

/**
 * Expected drop in the entropy of the event "theta >= R" if the item were asked.
 * It is the same expected-information idea as the question engine, on the event that decides the band.
 */
export function expectedGain(post: readonly number[], item: Item, R: number): number {
  const p0 = fitProbability(post, R);
  const h0 = binaryEntropy(p0);
  let pRight = 0;
  for (let k = 0; k < GRID.length; k++) pRight += post[k] * pCorrect(GRID[k], item.b);
  const after = (correct: boolean) =>
    normalize(post.map((p, k) => p * (correct ? pCorrect(GRID[k], item.b) : 1 - pCorrect(GRID[k], item.b))));
  const hR = binaryEntropy(fitProbability(after(true), R));
  const hW = binaryEntropy(fitProbability(after(false), R));
  return h0 - (pRight * hR + (1 - pRight) * hW);
}

export const SURE_AT = 0.9;
export const DEFAULT_ITEM_BUDGET = 8;
/** No judgement about a person before this many answers. The prior is a starting guess, not a finding. */
export const MIN_ITEMS = 3;

export type FitStop = "sure-above" | "sure-below" | "budget" | "no-items";

export function nextItem(
  items: readonly Item[],
  responses: readonly Response[],
  R: number,
  budget = DEFAULT_ITEM_BUDGET,
): { stop: FitStop; item: null } | { stop: null; item: Item; gain: number } {
  const post = posterior(items, responses);
  const p = fitProbability(post, R);
  // Never judge before the person has answered enough items, whatever the prior says.
  if (responses.length >= MIN_ITEMS) {
    if (p >= SURE_AT) return { stop: "sure-above", item: null };
    if (p <= 1 - SURE_AT) return { stop: "sure-below", item: null };
  }
  if (responses.length >= budget) return { stop: "budget", item: null };
  const asked = new Set(responses.map((r) => r.itemId));
  let best: { item: Item; gain: number } | null = null;
  for (const it of items) {
    if (asked.has(it.id)) continue;
    const g = expectedGain(post, it, R);
    if (best === null || g > best.gain + 1e-12) best = { item: it, gain: g };
  }
  return best ? { stop: null, item: best.item, gain: best.gain } : { stop: "no-items", item: null };
}
