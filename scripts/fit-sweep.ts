import { GRID, fitProbability, pCorrect, type Item } from "../src/core/fit";

/**
 * Sweeps the prior spread and the item count for noise-free students, to see how often a student who really
 * reaches the requirement is called "sure below" (a false mismatch) and the reverse. A study of the model, not a test.
 */
const bank: Item[] = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5].map((b, i) => ({ id: `i${i}`, b }));
const R = 2.0;

function norm(w: number[]) { const s = w.reduce((a, x) => a + x, 0); return w.map((x) => x / s); }
function post(sd: number, resp: { b: number; ok: boolean }[]) {
  let w = norm(GRID.map((t) => Math.exp(-0.5 * (t / sd) ** 2)));
  for (const r of resp) w = norm(w.map((p, k) => p * (r.ok ? pCorrect(GRID[k], r.b) : 1 - pCorrect(GRID[k], r.b))));
  return w;
}
// Expected-information item choice on the event theta >= R, for a given prior sd.
function gain(w: number[], b: number) {
  const H = (p: number) => (p <= 0 || p >= 1 ? 0 : -(p * Math.log(p) + (1 - p) * Math.log(1 - p)));
  const p0 = fitProbability(w, R);
  let pr = 0;
  for (let k = 0; k < GRID.length; k++) pr += w[k] * pCorrect(GRID[k], b);
  const a = (ok: boolean) => norm(w.map((p, k) => p * (ok ? pCorrect(GRID[k], b) : 1 - pCorrect(GRID[k], b))));
  return H(p0) - (pr * H(fitProbability(a(true), R)) + (1 - pr) * H(fitProbability(a(false), R)));
}

console.log("prior sd | items asked | true theta -> P(theta>=R) after n items (noise-free student)");
for (const sd of [1, 1.5, 2, 3]) {
  for (const n of [3, 5, 8]) {
    const cells: string[] = [];
    for (const theta of [-0.5, 1.0, 1.8, 2.2, 2.6]) {
      const resp: { b: number; ok: boolean; }[] = [];
      const asked = new Set<number>();
      for (let i = 0; i < n; i++) {
        const w = post(sd, resp);
        let best = -1, bg = -1;
        bank.forEach((it, idx) => { if (asked.has(idx)) return; const g = gain(w, it.b); if (g > bg + 1e-12) { bg = g; best = idx; } });
        asked.add(best);
        resp.push({ b: bank[best].b, ok: bank[best].b <= theta });
      }
      cells.push(`${theta.toFixed(1)}:${fitProbability(post(sd, resp), R).toFixed(2)}`);
    }
    console.log(`sd=${sd}  n=${n}  ${cells.join("  ")}`);
  }
}
