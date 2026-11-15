/** Small, pure probability and information-geometry helpers. No dependencies. */

export type Dist = readonly number[];

function assertSameLength(p: Dist, q: Dist): void {
  if (p.length !== q.length) {
    throw new Error(`distribution length mismatch: ${p.length} vs ${q.length}`);
  }
}

export function sum(xs: readonly number[]): number {
  let s = 0;
  for (const x of xs) s += x;
  return s;
}

export function uniform(n: number): number[] {
  return Array.from({ length: n }, () => 1 / n);
}

/** Scale non-negative weights to sum to 1. Falls back to uniform if the total is not positive. */
export function normalize(weights: readonly number[]): number[] {
  const s = sum(weights);
  if (!(s > 0) || !Number.isFinite(s)) return uniform(weights.length);
  return weights.map((w) => w / s);
}

/** Shannon entropy in nats. */
export function entropy(p: Dist): number {
  let h = 0;
  for (const x of p) if (x > 0) h -= x * Math.log(x);
  return h;
}

/** KL(p || q) in nats. Infinity if q has zero mass where p has mass. */
export function kl(p: Dist, q: Dist): number {
  assertSameLength(p, q);
  let d = 0;
  for (let i = 0; i < p.length; i++) {
    if (p[i] > 0) {
      if (q[i] <= 0) return Infinity;
      d += p[i] * Math.log(p[i] / q[i]);
    }
  }
  return d;
}

/**
 * Fisher-Rao distance between two categorical distributions.
 * The map p -> sqrt(p) sends the simplex to the positive orthant of the unit sphere,
 * where the Fisher metric is a scaled round metric. The distance is 2 * arccos(sum sqrt(p_i q_i)),
 * in [0, pi].
 */
export function fisherRao(p: Dist, q: Dist): number {
  assertSameLength(p, q);
  let bc = 0;
  for (let i = 0; i < p.length; i++) bc += Math.sqrt(p[i] * q[i]);
  const clamped = Math.min(1, Math.max(0, bc));
  return 2 * Math.acos(clamped);
}

/**
 * Generalized Jensen-Shannon divergence of several distributions with weights.
 * Equals the mutual information between "which party" and "which outcome",
 * so it is zero iff everyone holds the same belief.
 */
export function jsd(dists: readonly Dist[], weights?: readonly number[]): number {
  if (dists.length === 0) return 0;
  const n = dists[0].length;
  const w = weights ? normalize(weights) : uniform(dists.length);
  const mixture = new Array<number>(n).fill(0);
  dists.forEach((d, k) => {
    assertSameLength(d, dists[0]);
    for (let i = 0; i < n; i++) mixture[i] += w[k] * d[i];
  });
  let avgH = 0;
  dists.forEach((d, k) => {
    avgH += w[k] * entropy(d);
  });
  return Math.max(0, entropy(mixture) - avgH);
}
