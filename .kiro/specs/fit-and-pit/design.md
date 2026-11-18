# Fit and pit: design

## Fit (`src/core/fit.ts`)
- Ability theta on a grid of 121 points from -3 to 3. Prior: standard normal, normalized on the grid.
- Item i has difficulty b_i. P(correct | theta, b) = c + (1 - c) * sigmoid(theta - b), with c = 0.25 for four-option items. This is a three-parameter logistic model with discrimination fixed at 1 (a Rasch model with a guessing floor).
- Posterior after answers: prior times the product of P(correct) or 1 - P(correct). Normalized. Order of answers does not matter (the product commutes).
- `fitProbability(posterior, R)` = sum of posterior mass at theta >= R.
- Band: fit if p >= 0.8, mismatch if p <= 0.2, else stretch. These cut-offs follow the A and E judgment of mock exams (80% and 20%). They are reading aids, not model parameters.
- Uncertainty: the central 80% interval of theta. IF the interval contains R and p is inside (0.2, 0.8) the band is "stretch"; no further claim.
- Next item: the unasked item with the largest expected reduction in the entropy of the binary event "theta >= R". It uses the same expected-information idea as `engine.ts`, on the event that matters for the decision.
- Stop: when p >= 0.9 or p <= 0.1, or at the item budget.
- `requirement.source` is required for a band. Without it the result is `{ kind: "no-reference" }`.

## Pit (`src/core/pit.ts`)
- Two types of task: easy (success probability per same-approach attempt `pe`) and hard (`ph`). Prior weight of hard: `w0`. All three are authored numbers.
- After k failures of the same approach, P(hard | k) = w0 * (1 - ph)^k / (w0 * (1 - ph)^k + (1 - w0) * (1 - pe)^k).
- Next success probability: pNext = P(hard | k) * ph + (1 - P(hard | k)) * pe. It does not increase with k when pe > ph.
- A new approach resets k to 0 (it is a new run). Time spent is not an input, so sunk cost cannot enter.
- Decision: "switch" when pNext < pSwitch (success probability of a fresh approach, authored), else "persist". Both numbers are returned.
- Why this shape: if run times are heavy-tailed, a long run is evidence that this run is in the tail, and a restart beats waiting (Gomes et al.). The two-type mixture is the smallest model with that property.
- Moves for "switch" come from the pack: moves whose id is in a list `restartMoves` (for devstuck: make-minimal, fresh-context, state-goal, outside-view).

## MCP and UI
- New tools: `fit_check` and `pit_check`, stateless, same input style as the others.
- The web app uses the same functions. UI is not part of this slice (see tasks).

## Honest limits
- The Rasch model with equal discrimination is a simplification. Item difficulties here are authored and uncalibrated: no real responses were collected.
- Requirement levels for the demo are authored from stated reasoning and labelled "rule of thumb, not tested" unless a source is named.
- A band is not a prediction of the outcome. A wrong "mismatch" discourages a person who could succeed; the width of the interval is shown for that reason.
- pe, ph, w0 and pSwitch are authored. Property tests check their effect (monotone, bounded), not their truth.
- Measured on 2026-11-17: over 81 combinations of pe in {0.4, 0.5, 0.7}, ph in {0.02, 0.04, 0.1}, w0 in {0.2, 0.4, 0.6} and pSwitch in {0.1, 0.2, 0.3}, the number of same-approach failures after which the verdict becomes "switch" is 0 to 7, or never (9 of 81). With the default numbers it is 2. So the shape (falling success chance) is robust and the count is not. The product shows pNext and pSwitch side by side and does not state the count as a conclusion.

## Tests (fast-check)
- fit: posterior sums to 1; answer order does not change it; a correct answer to an item of difficulty at or above the current mean never lowers P(theta >= R); a wrong answer never raises it; no source gives no band; p is in [0, 1]; stop rule fires only at the stated thresholds.
- pit: pNext does not increase in k; pNext equals the prior mean at k = 0; a new approach gives the k = 0 value; spending more time changes nothing (the function has no time input); decision is monotone in pSwitch.
