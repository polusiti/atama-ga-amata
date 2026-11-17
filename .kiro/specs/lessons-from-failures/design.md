# Lessons from failures: design

## Incident record
`docs/incidents.md`. Entry fields: id, what happened, conditions (what in the setup allowed it, not who), how it was noticed, what changed, source label. Written without blame, after Google's SRE postmortem practice. The wording rules in `voice.md` apply.

## Steering
`.kiro/steering/agent-conduct.md`, `inclusion: always`. Each rule is one line plus the incident id. Rules are kept short, because rumornet-style long prohibitions are hard to follow and to audit.

## Coverage report
- `src/core/coverage.ts`: `needCoverage(kb, lexicon, samples)` returns one row per need. Pure.
- A probe is discriminating for a need when `|yes[need] - base| >= 0.3`. The threshold is a hand-chosen reading aid, not a model parameter.
- A move fits a need when `fit >= 0.5`. Named source means the `source` text does not start with the rule-of-thumb label.
- `scripts/pack-report.ts` prints a table per pack and exits 1 when `gaps` is not empty. Run with `npm run report`.

## Hook
`pack-coverage`: PostFileSave on `src/data/*.ts` and `src/core/lexicon.ts`, command `npm run report`. It reports; it does not edit. The reason is `evidence.md`: an agent that fills in numbers would turn a judgement into an unmarked guess.

## Why not an agent hook that scaffolds the missing parts
InteractionKit's hook edits files because its edits are mechanical (an import, a field). Ours would have to invent probabilities. So only the report is automated.
