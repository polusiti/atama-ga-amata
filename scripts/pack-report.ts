import { hasGaps, needCoverage } from "../src/core/coverage";
import { packs } from "../src/data/packs";

/** Prints coverage per pack and exits 1 when any need has a gap. It never edits anything. */
let failed = false;
for (const pack of Object.values(packs)) {
  const rows = needCoverage(pack.kb, pack.lexicon, pack.samples);
  console.log(`\n${pack.id}: ${pack.kb.needs.length} needs, ${pack.kb.questions.length} probes, ${pack.kb.solutions.length} moves`);
  console.log("need".padEnd(22) + "probes moves sourced words samples  gaps");
  for (const r of rows) {
    console.log(
      r.needId.padEnd(22) +
        [r.probes, r.moves, r.sourcedMoves, r.words, r.samples].map((n) => String(n).padStart(6)).join(" ") +
        "  " +
        (r.gaps.length ? r.gaps.join(", ") : "-"),
    );
  }
  if (hasGaps(rows)) failed = true;
}
console.log(failed ? "\nGAPS FOUND" : "\nno gaps");
process.exitCode = failed ? 1 : 0;
