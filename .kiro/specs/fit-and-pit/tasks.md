# Fit and pit: tasks

- [x] 1. `src/core/pit.ts` and property tests (req 7-10): 10 tests. Measured sensitivity: the count of failures before "switch" ranges 0 to 7 or never over 81 parameter sets, so the product shows pNext and pSwitch, not a count.
- [x] 2. `src/core/fit.ts` and property tests (req 1-6): 22 tests. Running a demo found two faults that the first tests did not catch: it judged after 0 answers (now MIN_ITEMS = 3), and an item bank that does not reach both sides of the level cannot measure it (now `cannot-measure`).
- [ ] 3. Pack data: requirement levels with sources or "no reference"; item bank that covers each level; restart moves for devstuck (req 3, 6b, 11, 13). **Open.** No sourced requirement levels exist yet. Authored levels would be labelled "rule of thumb, not tested".
- [ ] 4. MCP tools `pit_check` and `fit_check`, tests (req 14)
- [ ] 5. Count the new authored numbers in the limits panel (req 13)
- [ ] 6. Voice check of every new string (req 12)
- [ ] 7. UI (separate slice, after the core is verified)

Findings so far (2026-11-17):
- `scripts/fit-sweep.ts`: with a bank whose hardest item is 2.5, a person at theta 2.2 to 2.6 reaches P(theta >= 2) of only 0.15 to 0.72 after 8 items, never "fit". The model cannot call strong people fit when the bank does not extend well above the level. This is why coverage is checked.
- `scripts/fit-demo.ts`: noise-free students at deviation scores 45, 60 and 72 are all called mismatch against a level of 70 after 3 items. For the third student this is a false mismatch caused by the bank and the prior, not a fact. The demo scale is a placeholder.
