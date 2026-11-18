import { isSourced } from "../src/core/escape";
import { packs } from "../src/data/packs";

/**
 * Checks that the guard in sheets.test.ts would catch a violation, by applying the same rule to deliberately wrong data.
 * Nothing is written. Prints what the rule says about three invented sheets.
 */
const byId = new Map(packs.devstuck.kb.solutions.map((s) => [s.id, s]));
const wrong: { id: string; why: string }[] = [
  { id: "timebox", why: "a sheet for a move that names no source" },
  { id: "step-away", why: "a sheet for a move that names no source" },
  { id: "state-goal", why: "a sheet for a move marked only as the XY problem, rule of thumb" },
];
for (const w of wrong) {
  const caught = !isSourced(byId.get(w.id)?.source);
  console.log(`${w.id.padEnd(12)} ${caught ? "CAUGHT" : "MISSED"}  (${w.why})`);
}
const banned = [/proven/i, /\beffective\b/i, /guarantee/i, /実証/, /必ず効/, /確実に効/];
for (const t of ["This method is proven to work.", "It is an effective way out.", "必ず効きます", "It may help."]) {
  console.log(`${banned.some((b) => b.test(t)) ? "CAUGHT" : "passes"}  "${t}"`);
}
