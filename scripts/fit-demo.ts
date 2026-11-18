import { fitCheck, fitProbability, interval, nextItem, posterior, priorPosterior, type Item, type Response } from "../src/core/fit";

/**
 * Runs the fit check on noise-free simulated students, to see whether the model agrees with intuition.
 * The scale is a placeholder, not calibrated: theta = (deviation score - 50) / 10. The level R = 2 ("about 70")
 * is an assumption for the demonstration, not a fact about any university.
 */
const bank: Item[] = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5].map((b, i) => ({ id: `i${i}`, b }));
const R = 2.0;

function run(label: string, solves: (b: number) => boolean) {
  const rs: Response[] = [];
  let stopped = "ran out of loop";
  for (let n = 0; n < 12; n++) {
    const r = nextItem(bank, rs, R);
    if (r.stop !== null) {
      stopped = `${r.stop} after ${rs.length} items`;
      break;
    }
    rs.push({ itemId: r.item.id, correct: solves(r.item.b) });
  }
  const post = posterior(bank, rs);
  const res = fitCheck(post, { level: R, source: "placeholder" });
  console.log(
    `${label}: ${stopped}; P(theta>=R)=${fitProbability(post, R).toFixed(3)} band=${res.kind === "band" ? res.band : res.kind} ` +
      `interval80=[${interval(post).map((x) => x.toFixed(2)).join(", ")}] asked=${rs.map((x) => bank.find((i) => i.id === x.itemId)!.b + (x.correct ? "+" : "-")).join(" ")}`,
  );
}

run("deviation 45 (theta -0.5)", (b) => b <= -0.5);
run("deviation 60 (theta  1.0)", (b) => b <= 1.0);
run("deviation 72 (theta  2.2)", (b) => b <= 2.2);
const p0 = priorPosterior();
console.log(`no answers: P(theta>=R)=${fitProbability(p0, R).toFixed(3)}`);
