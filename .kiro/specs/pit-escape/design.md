# Pit escape: design

## Flow
1. Attempts. The person lists the last attempts. For each, two taps: "same approach as the one before" or "a new approach", and "a new fact appeared" or "nothing new". No free text is needed.
2. Verdict. `pitCheck` gives `pNext` and `pSwitch`. The screen states both, in words, next to the sentence: "The same approach has failed N times in a row. The chance that another try of it works is about X%. A fresh approach is guessed at Y%. Both numbers are set by hand."
3. Cause questions. Up to five yes/no/unknown questions taken from the existing probes (reproduction, new facts, long conversation, the AI agreeing, size). Answers feed the existing belief engine restricted to the exit-relevant needs.
4. Exit. Up to three moves with a named source, ranked by the belief. Each shows cost and source.
5. Return. The person picks one, tries it, adds the result as an attempt (a new approach, with or without a new fact). The verdict is recomputed.

## Code
- `src/core/pit.ts` (done): the verdict.
- `src/core/escape.ts` (new, pure): `isSourced(source)` and `exitMoves(kb, belief, n)`. A move is sourced when its source text contains a year in a citation (for example "Zeller 2009", "Laban et al. 2025") or does not contain the rule-of-thumb label. Moves are ranked by the existing expected-fit score. At most `n` returned. If none is sourced, the function returns an empty list and the caller says so.
- `mcp/tools.ts`: `pitCheck(input)` takes `attempts` and optional `answers`, returns the verdict, the cause ranking and the exit moves.
- `mcp/server.ts`: tool `pit_check`.
- `.kiro/steering/pit-guard.md`: the rule for the agent, inclusion always.
- UI: a new screen as default, built on the same functions (separate slice).

## Why the sourced-only rule
Of the 17 developer moves, 6 name a source and 11 carry the rule-of-thumb label. The 6 are Zeller's methods; 2 more name a study and add a rule of thumb for how to apply it. A pit escape that recommends an untested move to a person who is already stuck adds a guess to a stuck situation.

## Honest limits
- The verdict depends on four hand-set numbers (see fit-and-pit design). The shape is robust, the count is not.
- "New fact appeared" is self-reported. An agent calling the tool on its own history reports it from what it observed. The tool cannot check either.
- The exit list fits one kind of pit: chasing the cause of a failure. Run on the agent's own case of 2026-11-17 (the same shape of long command, interrupted again and again by the environment), `scripts/pit-case.ts` says "switch" from the second failure, which matches what should have happened, but its exits are add-evidence, refute and fresh-context. The exit that worked (change the shape of the call: start in the background, read the result in a separate call) is not in the list. The pack has no moves for pits caused by the tool or the environment. This is a gap in the data, not a fault in the verdict.
- No evidence yet that following an exit move gets people out. The moves come from published methods for debugging and for multi-turn conversations, not from a test of this product.

## Tests
- `exitMoves` returns only sourced moves, never more than n, and an empty list when none is sourced.
- `pitCheck` tool: bad input gives an error result; same input gives the same result; a history of new approaches never gives "switch".
- Existing tests stay green.
