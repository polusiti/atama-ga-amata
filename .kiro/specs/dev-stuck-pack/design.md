# Developer-stuck pack: design

## Data
`src/data/devstuck.ts`: 12 needs (stall types), 27 probes, 17 moves. Probes are concrete practices or past episodes ("Did you paste the full error?"), not abstract preferences, because people recall episodes better than they rate traits.

## Probe kinds
- Practice probe (`practice: moveId`): a yes means the move is already in place. Used by `fringe.ts` to mark moves done, blocked (a `requires` step missing) or next.
- Signal probe: a yes raises a stall.
- Reverse-keyed probe: a yes lowers a stall. Used to catch agreeing with everything.

## Sources used
Laban et al. 2025 (arXiv:2505.06120, multi-turn drop), Sharma et al. 2023 (arXiv:2310.13548, sycophancy), Zeller (delta debugging). Moves without a read source say "rule of thumb, not tested".

## Engine settings
Answer noise sigma 0.25, unknown 0.1, mention 0.3, lapse 0.1 (a floor on every answer, which bounds the evidence of one answer). Stop: 4 to 8 answers, confidence 0.85. These are chosen by hand and benchmarked in `docs/benchmark.md`; the devstuck pack is not yet benchmarked.

## Known gap
No "none of these" hypothesis, so with random answers the engine can still look confident.