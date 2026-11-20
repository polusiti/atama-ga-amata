# Reader worker: design

## Parts
- `src/core/reader.ts` (pure, tested): `parseReading(raw)` returns `{ newApproach, newFact } | null`. It accepts only an object with exactly those two keys, each `true`, `false` or `null`. It also holds `describeReading(reading, lang)`, the sentence the shopkeeper shows ("I read this as: a different approach, no new fact. Add it as a try?").
- `worker/index.ts` (Cloudflare Worker): `POST /read` with `{ text, lang }`.
  1. Check `Origin` against the allowed list. Otherwise 403.
  2. Check `text` is a string of 1 to 500 characters. Otherwise 400.
  3. Rate limit with the Workers rate-limit binding, keyed by caller IP.
  4. Call the model through the `AI` binding with a fixed system prompt and a JSON schema response format. The typed text is passed only as the user message and is described to the model as data.
  5. Run the same `parseReading` on the model output. If it is invalid, answer `{ ok: false }`. Otherwise `{ ok: true, reading }`.
  6. Never log the text. Return no model text.
- `src/app/reader.ts` (client): `readSentence(text, lang)` posts to the worker URL with a 6 second timeout, runs `parseReading` again on the answer (the worker is not trusted by the client either), and returns the reading or an error kind (`unreachable`, `timeout`, `limit`, `invalid`).
- UI: in focus mode, the shopkeeper's text box on the pit screen sends the sentence to `readSentence`. The shopkeeper shows the proposal with Yes / No. Yes appends the attempt with the proposed fields; a null field is left unchecked and the shopkeeper says to set it by hand. No does nothing.

## Choices
- Model: a small instruction model on Workers AI, chosen for the free allocation. The exact model name is set in `wrangler.jsonc` and recorded in the journal. If the quality is too low in the measurement below, the change is a one-line edit.
- The shape is two booleans on purpose. A model that is wrong can mislabel a try, and the person sees and corrects it. A model that is attacked cannot do more than that.
- Cost: on the Free plan the daily allocation is 10,000 neurons (Cloudflare Workers AI pricing page, read 2026-11-20). Over that, calls fail. The site then falls back to the checkboxes (requirement 7). An estimate of about 6 neurons per call, so about 1,600 calls a day, rests on assumed token counts and is to be checked against the dashboard.
- The worker URL is a build-time public value (`NEXT_PUBLIC_READER_URL`). It is not a secret. There is no secret in the site.

## Measurement (before it is shown in the demo)
A set of 20 hand-written sentences per language (10 same approach, 10 different; some with a new fact), run against the live worker. Report: how often `newApproach` matches the hand label, how often the answer is null, how often the output is rejected. If the match rate is low, say so in the README. Do not tune the sentences to the result.
