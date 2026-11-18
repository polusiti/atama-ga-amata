import { packs } from "../src/data/packs";

/** Prints each developer move with its source text, so the "sourced" rule can be checked by eye. Read-only. */
for (const s of packs.devstuck.kb.solutions) {
  console.log(`${s.id.padEnd(20)} | ${s.source?.en ?? "(none)"}`);
}
