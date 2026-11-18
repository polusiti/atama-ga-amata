# Pit escape: tasks

- [x] 1. `src/core/escape.ts` and tests (req 4, 5): 7 tests. The sourced rule matches the real data exactly: 8 of 17 developer moves name a source (Zeller x6, Laban, Sharma), 9 carry only the rule-of-thumb label.
- [x] 2. MCP tool `pit_check` and tests (req 1-3, 8): 8 new tests, and a live check of a fresh server (5 tools; four same-approach failures give "switch" with add-evidence, fix-repro, make-minimal). **Open for the user:** `.kiro/settings/mcp.json` is a protected path; the agent may not write it. To skip the confirmation prompt, add `"pit_check"` to `autoApprove` by hand. The running IDE server also needs a restart to expose the new tool.
- [x] 3. `.kiro/steering/pit-guard.md` (req 9)
- [x] 4. Run the tool on the real history of 2026-11-17 and record the result. Recorded under INC-17 in docs/incidents.md: under the hand-set numbers the verdict is switch from the second same-approach failure on. The exact number of real repeats is unknown, so it is a sensitivity table.
- [x] 5. UI: default screen (req 1, 4, 6, 7, 10). The pit tab opens first on the developer shelf; 11 browser checks pass. Exit moves are ranked by the shop answers, not by a separate five-question form (req 4 differs here).
- [x] 6. README and one-sentence description (README: the one job, honest limits, MCP and steering rows updated)
- [x] 7. Demo script around the real case from task 4 (docs/demo-script.md; written, not yet rehearsed or timed)
