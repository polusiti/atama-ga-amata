# Explain: design

## Two questions, two functions
- WHY is this question asked: `explainWhy` shows the leading needs, how strongly a "yes" holds for each, and the answer outcomes with the top need each would lead to. Modelled on MYCIN's WHY (Shortliffe 1976).
- HOW did the belief get here: `traceBelief` replays the evidence one item at a time in the same order as `replayBelief` (stated solution, notes, answers). `contributions` turns the trace into one multiplier per evidence item for one need. The product of the multipliers equals final/start (tested).

## UI
Details panel under the belief box. Plain words first (which answer raised or lowered the stall), numbers second. The trace is derived from the answers, so undo needs no extra state.

## Limits
Multipliers are exact for this model, which is hand-authored. They explain the model, not the world.