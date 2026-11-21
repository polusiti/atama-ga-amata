# Idea burst: tasks
- [x] 1. `src/core/ideas.ts` and tests (req 2, 3, 4, 5): the fixed rules, property tests over random output, examples that must be rejected in both languages.
- [x] 2. `worker/moves.ts` and `worker/ideas.ts` with tests (req 2, 9, 10).
- [x] 3. Try the models on the account, pick one, set `IDEAS_MODEL`, deploy.
- [x] 4. `src/app/ideas.ts` client with timeout (req 8).
- [x] 5. UI: "Get ideas", the notice, five cards, the buttons (req 1, 5, 7, 11).
- [x] 6. Measurement (8 situations per language), reported as it is.
- [x] 7. README, submission text and demo script; push and check the public site.

Notes: the first model tried (llama-3.2-3b) passed the rules every time but gave shallow ideas. The larger one (llama-3.3-70b) wrote too long, so the worker now cuts to the limit at the end of a sentence. Measured 8 situations per language: English 8 of 8 pass, Japanese 6 of 8 (after the language rule was added; an earlier 8 of 8 is withdrawn). The model may answer in English to a Japanese question, so the language rule exists on both sides.
