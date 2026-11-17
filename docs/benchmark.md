# Benchmark: does the engine get pulled into confident wrong beliefs?

Run: `npm run bench`. Output: `bench/results/echo-probe.txt`.

## Why

A tester pointed out that questions pull the AI too far toward its current guess, and that it then cannot get out, like an echo chamber. We measured it instead of arguing about it.

## Setup

Four simulated users answer the same probes on the everyday shelf (8 needs), 600 runs each, fixed seed 12345. The engine picks questions by expected information gain per unit of effort and stops by the app's rule.

| user | what they do |
|---|---|
| truthful | answers from the model the engine assumes (optimistic: same model on both sides) |
| always-yes | answers "yes" to everything (agreeable) |
| random | answers uniformly at random |
| off-shelf | each answer reflects an unrelated strength, as if the real trouble were not on the shelf |

## Results

Before: answer model without a lapse rate, no minimum number of answers.

| user | stopped confident | accuracy when confident | questions |
|---|---|---|---|
| truthful | 84.8% | 93.1% | 4.7 |
| always-yes | **100%** (two answers, 99.4% belief) | 13.0% | 2.0 |
| random | 81.2% | 11.3% | 4.5 |
| off-shelf | 83.0% | 11.2% | 4.3 |

After: 10% of answers are treated as random whatever the truth (lapse rate), and no conclusion of any kind (confident or "low value") before four answers.

| user | stopped confident | accuracy when confident | questions |
|---|---|---|---|
| truthful | 62.7% | 90.2% | 5.7 |
| always-yes | **0%** | n/a | 4.0 |
| random | 46.7% | 12.9% | 5.8 |
| off-shelf | 44.8% | 13.0% | 5.8 |

(An earlier run of this table, 60.5% / 42.7% / 42.3%, applied the four-answer minimum only to the "confident" stop. The "low value" stop could still end the questions after two answers. A screenshot of the app showed it; the rule now covers both, and the test says so.)

Chance is 12.5% (8 needs).

## What this shows

- The always-yes failure is fixed: two agreeable answers can no longer produce near certainty. The lapse rate bounds the evidence of any single answer (tested as a property).
- It is **not** fixed for random and off-shelf users. About four in ten still stop "confident" with chance-level accuracy. The engine has no "none of these" hypothesis, so evidence that fits no need is forced onto one of them. Next step: add that hypothesis, abstain ("I can't tell") when it wins, and re-run this benchmark.
- The cost of the fix is real: truthful users now get a confident conclusion less often (84.8% to 60.5%) and need about one more question.

## Limits

- The truthful row uses the engine's own model, so it is optimistic, and its good calibration (confidence about equal to accuracy) is partly circular.
- No real people. A small study with real users is still needed.
- This benchmark runs on the everyday shelf. The developer-stuck shelf has not been benchmarked yet.
- Related result: Golovin, Krause and Ray (2010) show that with noisy answers, greedy information gain can perform poorly. We have not yet compared against their EC2 algorithm.
