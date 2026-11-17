import { packs } from "../src/data/packs";

/** Counts moves by source state per pack. Read-only. */
for (const pack of Object.values(packs)) {
  let none = 0, rough = 0, named = 0;
  for (const s of pack.kb.solutions) {
    const text = `${s.source?.en ?? ""} ${s.source?.ja ?? ""}`.toLowerCase().trim();
    if (!text) none++;
    else if (text.includes("rule of thumb") || text.includes("経験則")) rough++;
    else named++;
  }
  console.log(`${pack.id}: moves=${pack.kb.solutions.length} named source=${named} rule-of-thumb label=${rough} no source field=${none}`);
}
