# Guess and confirm: design

## Core (`src/core/guess.ts`, pure)
- `applyRejections(belief, rejected)`: multiply rejected indices by `REJECT_FACTOR`, renormalize.
- `pickGuess(belief, rejected)`: highest-probability index not in `rejected`, or null.
- `wilson(k, n)`: Wilson score interval, 95%. `n = 0` gives [0, 1].
- `summarize(records)`: counts, match rate over decided rounds, its interval, mean first-guess probability.
- `exportRecords(records)`: JSON with a schema version. No free text.

## Flow
Stop rule fires -> guess panel. "Matches" ends the round. "Not quite" adds to `rejected`; the belief is recomputed with the rejection; if the stop rule no longer fires, questions resume. After `MAX_GUESSES` (2) rejections a picker asks for the closest need. "Can't tell" ends the round as unsure.

## Why the factor is 0.05 and not 0
A person can misjudge their own stall. Zero would make a wrong rejection unrecoverable, which is the collapse that Aaklon's smoothing note and the lapse rate in the answer model both guard against. 0.05 is hand-chosen, like the other parameters.

## Honest limits
- Verdicts come from the person's own judgement. "Matches" means it felt right, not that it was the cause.
- With few rounds the interval is wide. The UI says so.
- Records live in React state only.

## Tests
fast-check: `applyRejections` sums to 1, keeps ratios among non-rejected, lowers rejected; `pickGuess` never returns a rejected index; `wilson` stays in [0,1] and contains k/n; `summarize` counts add up.
