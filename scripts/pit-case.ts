import { pitCheckTool } from "../mcp/tools";

/**
 * The real case of 2026-11-17: a long command in one call was interrupted several times, then the shape was changed.
 * The exact number of repeats cannot be recovered, so this shows the range, not a count. It is a sensitivity table.
 */
const rows: string[] = [];
for (const n of [1, 2, 3, 4, 5]) {
  const attempts = Array.from({ length: n }, () => ({ newApproach: false, newFact: false }));
  const r = pitCheckTool({ attempts, answers: [{ qid: "s-flaky", answer: "no" }] });
  if (!r.ok) throw new Error(r.error);
  const d = r.data as { verdict: string; chanceNextTryOfSameApproachWorks: number; chanceFreshApproachWorks: number; exitMoves: { id: string }[] };
  rows.push(`${n} failures of the same approach -> ${d.verdict.padEnd(7)} next=${d.chanceNextTryOfSameApproachWorks} fresh=${d.chanceFreshApproachWorks} exits=${d.exitMoves.map((m) => m.id).join(",") || "-"}`);
}
// After the shape was changed (start in the background, read the result in a separate call): a new approach, and a new fact (the result file appeared).
const after = pitCheckTool({ attempts: [{ newApproach: false }, { newApproach: false }, { newApproach: false }, { newApproach: true, newFact: true }] });
if (!after.ok) throw new Error(after.error);
const a = after.data as { verdict: string; sameApproachFailuresInRun: number };
rows.push(`after the change of shape -> ${a.verdict}, failures in run = ${a.sameApproachFailuresInRun}`);
console.log(rows.join("\n"));
