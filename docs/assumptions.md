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
