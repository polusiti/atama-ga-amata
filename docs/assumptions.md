# Assumptions and limits

These are choices made by the author, not measured facts. They are listed so judges and users can discount them.

1. **Knowledge base numbers are authored judgments.** `yes[need]` in questions and `fit[need]` in solutions are hand-set in [0, 1]. They are not learned from data.
2. **The answer model is assumed.** Noise `sigma = 0.25`, "don't know" share `0.1`, and the five answer centers (1, 0.75, 0.25, 0 plus "unknown") are defaults. Real users may differ. The benchmark is planned to vary them to test robustness.
3. **Solution fixation is assumed.** A user names a solution with probability `mention + (1 - mention) * fit`, `mention = 0.3`. This cannot be identified from data we have.
4. **Intent is partly constructed in conversation.** The model treats a hidden need as fixed. This is a simplification. Order effects and anchoring are not yet modeled; option order should be counterbalanced.
5. **Coverage is small.** Eight needs, twelve questions, ten solutions. Anything outside the shelf is not handled and the app should say so.
6. **The gap bands** ("close", "some gap", "large gap") use thresholds 0.35 and 0.9 radians. They are UI choices, not statistical tests.
7. **Fisher-Rao distances are only comparable on the same set of needs.** All parties share the one shelf.
8. **Simulated users share the engine's assumptions**, so a benchmark on them is optimistic. Misspecified-noise runs and a small check with real people are required before claiming effectiveness.

9. **The shelf can show 100%.** The authored numbers in the knowledge base are sharp, so noiseless answers push one need to nearly 1. That is the model's output, not certainty about the person.

10. **Browsing by trouble is a view filter.** Picking a trouble in the BROWSE list re-ranks the shelf by fit to that trouble but does not change the belief or the question flow.
11. **Movers & Shakers** shows the change in expected fit (percentage points) caused by the latest answer. It is computed from the belief before and after, not from any external data.

12. **The lexicon is hand-written.** Keywords and weights in `src/core/lexicon.ts` are the author's. The sample sentences that the tests expect to be recognized were written by the same author, so that test is a regression check, not a measure of accuracy. Coverage on other people's sentences is unknown and should be measured with sentences collected from real users.
13. **Text evidence is bounded.** Each matched keyword point multiplies the odds of a need by 1.8 at most 4 points (likelihood up to 4.2). One sentence cannot override the answers.
14. **Japanese matching is substring matching on normalized text.** There is no tokenizer. False hits (a keyword inside a longer word) and misses (paraphrases) are expected.
15. **The shopkeeper does not understand.** Replies are hedged templates. The About page says so (ELIZA effect). Reflection wording borrows from motivational interviewing; no effect is claimed.
16. **Voice is output only, opt-in, on-device only.** The toggle appears only when the browser exposes a voice with `localService` true. There is no speech input.

17. **Explanations are exact for the model, not for the world.** "Why ask?" previews the posterior after each possible answer using the same functions that apply the answer. "Why do you think so?" shows odds multipliers whose product equals final over start. Both inherit every assumption above (authored numbers, noise model).

18. **The geometry figure is exact for two beliefs, not for the world.** The drawn angle is half the Fisher-Rao distance between two model beliefs. "Efficiency" is straight-line distance divided by the path length of the belief; it describes how directly answers moved the model, not how good the answers were.
19. **The count of hand-set numbers is computed from the data** (`src/core/limits.ts`), so it changes when the knowledge base or lexicon changes.
