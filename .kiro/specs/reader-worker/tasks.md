# Reader worker: tasks
- [x] 1. `src/core/reader.ts` and tests (req 2, 3, 5): the validator rejects extra keys, wrong types, nested values and strings; a property test over random objects.
- [x] 2. `worker/index.ts`, `worker/wrangler.jsonc`, tests for the request checks (req 6, 9). Local run with `wrangler dev`.
- [x] 3. Deployed (2026-11-20) to the user's Cloudflare account on the Free plan (needs the user's go-ahead; it creates a public URL).
- [x] 4. `src/app/reader.ts` client with timeout and fallback (req 7).
- [x] 5. UI on the pit screen: the box, the notice (req 8), the proposal with Yes / No (req 1, 3).
- [x] 6. Measurement on 20 sentences per language, results reported as they are (README, section "The sentence reader"). Same approach found 10 of 10 in both languages; a new approach found 4 of 10 (English) and 3 of 10 (Japanese). The reader often invents a yes or no for the new-fact mark.
- [x] 7. README and the submission text: what the model does, what it does not, and the measured result.

Notes from the work:
- The first two models named in the Workers AI docs were deprecated (llama-3.1-8b-instruct on 2026-05-30, its fp8 variant on 2026-11-20), although a JSON-mode page and the catalogue still listed them. Found by tailing the worker log. The model is now a variable (MODEL), set to llama-3.2-3b-instruct.
- The worker logs the cause of a model failure with the typed text cut out, and nothing else.
