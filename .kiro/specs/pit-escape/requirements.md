# Pit escape: requirements

Scope decision (2026-11-17, by the user): the product does one thing. It helps a developer out of the antlion pit: repeating the same approach with an AI, failing, and sinking deeper. Everything else in the developer shelf is no longer the default path. Past winners kept to one narrow job and one workflow with a clear stop (OpenAI Build Week winners, as reported by a secondary source); they did not try to diagnose everything.

Principle (one sentence): when the same approach has failed repeatedly and no new fact has appeared, stop repeating it, say so with the numbers, switch to a sourced exit move, and leave the decision to the person.

Checked against other fields: a student who repeats the same chapter three times without gain; a patient whose drug does not work; an AI agent that tries the same fix a fourth time. It holds for each.

Dogfooding: on 2026-11-17 the agent that built this product sent the same shape of long command four times, each interrupted, and changed the shape only on the fifth. The agent is a user of this product.

## Requirements (EARS)

1. WHEN the person lists their recent attempts (for each: same approach as before or a new one; did a new fact appear), THE product SHALL return whether to persist or switch, with the chance that another try of the same approach works and the chance for a fresh approach, both shown.
2. THE product SHALL NOT state "switch after N tries" as a rule. It shows the two numbers and says that the numbers are set by hand (see fit-and-pit design: 0 to 7 across 81 parameter sets).
3. A new approach SHALL reset the count. Time already spent SHALL NOT enter the calculation.
4. WHEN the verdict is "switch", THE product SHALL propose at most three exit moves, chosen from moves that name a source, ranked by the answers to up to five short questions about the cause (no reproduction, no new facts, long conversation, the AI agreeing too easily, too big).
5. IF no exit move with a named source fits, THEN THE product SHALL say so and SHALL NOT offer a rule-of-thumb move as if it were sourced. Rule-of-thumb moves may be shown after the sourced ones, labelled.
6. THE product SHALL end with one choice for the person and a way to come back: after trying the exit move, the person adds the result as a new attempt, and the verdict is recomputed.
7. THE wording SHALL state that the approach is failing, not that the person is. No blame (see voice.md).
8. THE same functions SHALL be available to the agent through the MCP server as `pit_check`, so that an AI agent can check itself.
9. THE steering file `pit-guard.md` SHALL tell the agent: after two failed tries of the same approach, call `pit_check` with the attempt history; if it says switch, stop, tell the person, and propose the exit move before trying again.
10. THE default screen of the web app SHALL be this path. Other flows SHALL stay in the code and be reachable, and SHALL NOT be deleted in this slice.

## Parked, not deleted
- The 12-stall diagnosis as the default path.
- Fit judgement (`fit.ts`): it needs sourced requirement levels and a calibrated item bank, and neither exists. The code and its tests stay.
- The everyday shelf.

## Not in scope
- No claim that an exit move works for this person. Moves carry their sources and costs.
- No learning from the person's attempts across visits.
