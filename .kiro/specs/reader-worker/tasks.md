# Reader worker: tasks
- [ ] 1. `src/core/reader.ts` and tests (req 2, 3, 5): the validator rejects extra keys, wrong types, nested values and strings; a property test over random objects.
- [ ] 2. `worker/index.ts`, `worker/wrangler.jsonc`, tests for the request checks (req 6, 9). Local run with `wrangler dev`.
- [ ] 3. Deploy to the user's Cloudflare account on the Free plan (needs the user's go-ahead; it creates a public URL).
- [ ] 4. `src/app/reader.ts` client with timeout and fallback (req 7).
- [ ] 5. UI on the pit screen: the box, the notice (req 8), the proposal with Yes / No (req 1, 3).
- [ ] 6. Measurement on 20 sentences per language, results reported as they are.
- [ ] 7. README and the submission text: what the model does, what it does not, and the measured result.
