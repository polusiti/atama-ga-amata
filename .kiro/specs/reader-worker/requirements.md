# Reader worker: requirements

Decision (2026-11-20, by the user): a language model may be added, as a reader only, and its reading is checked before it is used, as a teacher or doctor checks before acting. The earlier rejection of a runtime model (cost, abuse, circular numbers) stands for everything except this reader, and each of those three risks is answered below.

Principle (one sentence): the model may propose how to read what the person typed, a validator rejects anything outside a fixed shape, and the person confirms before the reading touches a number.
Checked against other fields: a nurse who writes down what the patient said and reads it back before it goes in the chart; a teacher who restates a student's question and asks "is this what you meant?" before answering. Both hold.

## Requirements (EARS)
1. WHEN the person types a sentence about a try in the shopkeeper box on the pit screen, THE site SHALL send it to the reader worker and show the reading as a proposal: same approach or different approach, and new fact or no new fact.
2. THE reader's output SHALL be limited to two fields, `newApproach` and `newFact`, each true, false or null (null means it cannot tell). Anything else, including extra fields, free text or a wrong type, SHALL be rejected and treated as "could not read".
3. THE proposal SHALL NOT change the attempts or any number until the person presses "Yes". WHEN a field is null, THE site SHALL ask the person to set it with the checkboxes.
4. THE model SHALL NOT produce a probability, a verdict, an exit move or advice. Those stay with `pit.ts` and `escape.ts`.
5. THE typed text SHALL be treated as data. A sentence that tries to give the model instructions SHALL NOT be able to change anything beyond the two fields, because of requirement 2.
6. THE worker SHALL accept requests only from the site's own origin, limit the length of the text, rate-limit by caller, and run on the Cloudflare Workers Free plan, where use above the daily free allocation fails instead of being billed.
7. WHEN the worker is unreachable, slow (more than 6 seconds), over its limit, or returns an invalid reading, THE site SHALL say so in one line and keep working with the checkboxes. Nothing SHALL be stored or sent anywhere except the one request.
8. THE site SHALL say, near the box, that a language model reads the sentence, that it can be wrong, and that the person confirms.
9. THE worker SHALL NOT log the typed text.

## Not in scope
- No model on any other screen. The shop questions, the exit ranking and the plan stay deterministic.
- No claim that the reader is accurate in Japanese. It is measured on a small set of sentences, and the result is reported as it is (see tasks).
- No memory across visits.
