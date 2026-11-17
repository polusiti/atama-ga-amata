# User-side causes: design

## Problem
When an AI conversation stalls, the AI seldom says the cause is on the person's side. A diagnostic that only lists tool or model causes would repeat that.

## Approach
Four stalls marked `side: "self"`: mental-model-gap, unchecked-assumption, unclear-requirement, worn-out. Each has a signal probe (can be answered alone), a practice probe, and a move that is a self-test: something the person can check in a minute and decide for themselves.

## Wording rule
Written as "check whether", never "you did not". A test (`kb.test.ts`) rejects second-person fault phrases in every string of these needs and moves. The same pattern applies in teaching, shopping, home and design decisions, which is why the field is on `Need`, not on the pack.

## Limits
The self-tests are rules of thumb, labelled as such. The pack cannot tell whether a stall is really on the person's side; it ranks by the answers and shows the status of each move.