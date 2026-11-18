# Fit and pit: requirements

Principle (one sentence): when the person's state and plan clearly do not fit, say so with evidence and show a way out; when the person is in a loop where effort makes things worse (an antlion pit), say that continuing the same way is the worse bet, with numbers; never blame the person.

Checked against other fields before design: admissions (deviation score 45, target the University of Tokyo), development (cannot explain the code, wants the AI to rewrite it all), medicine (asks for a drug that is not indicated), finance (a product that does not suit the buyer's knowledge and purpose), and a repeated fix (five failures, no new facts).

Sources read: Gomes, Selman and Crato (heavy-tailed run times; restarts), Luby, Sinclair and Zuckerman (universal restart strategy), Staw 1976 and Arkes and Blumer 1985 (sunk cost), Fertin and Casas 2006 (the antlion pit sits at the angle of repose), IRT and adaptive testing (Rasch.org), Japan's suitability principle (FIEA Article 40), Sharma et al. 2023 and Cheng et al. 2025 (AI tends to affirm).

## Requirements (EARS)

### Fit
1. THE engine SHALL estimate a person's ability on one scale from graded answers, as a posterior over a grid, using a logistic item model with a lower bound for guessing.
2. WHEN a plan has a requirement level with a named source, THE engine SHALL return the probability that ability is at least that level, and a band: fit, stretch, or mismatch.
3. IF a plan has no requirement level with a source, THEN THE engine SHALL return "no reference" and SHALL NOT return a band.
4. THE engine SHALL return the probability and the width of its uncertainty together, and SHALL NOT state a band when the uncertainty is wider than the gap between the bands.
5. THE engine SHALL pick the next graded item by expected information about whether ability is above the requirement.
6. THE engine SHALL stop asking when it is 90% sure of the side (above or below), or after the item budget. THE engine SHALL NOT stop before a minimum number of answers (3), whatever the prior says. A prior is a starting guess, not a finding, and no judgement about a person may be made before the person has answered.

6b. THE engine SHALL check that the item bank covers the requirement: at least two items easier than the level by one unit or more, and at least two items harder than the level by one unit or more. IF the bank does not cover it, THEN THE engine SHALL return "cannot-measure" with the reason and SHALL NOT return a band. A measure cannot be better than the items it is made from.

### Pit
7. WHEN given a history of attempts, THE engine SHALL compute the probability that the next attempt with the same approach succeeds, using a mixture of an easy type and a hard type.
8. THE probability in 7 SHALL NOT increase as failures with the same approach accumulate, and SHALL NOT change because of time already spent (sunk cost).
9. A new approach SHALL reset the count of same-approach failures.
10. THE engine SHALL compare the probability in 7 with the success probability of a fresh approach and return "persist" or "switch", with both numbers.
11. WHEN the result is "switch", THE engine SHALL name moves from the pack that start fresh (for example a minimal reproduction or a restart with facts only), with their sources.

### Voice and honesty
12. THE wording SHALL state the gap or the loop plainly and SHALL NOT blame the person (see `voice.md`). A plan that does not fit is described as such; the person is not.
13. EVERY number set by hand (priors, the fresh-approach probability, requirement levels) SHALL be marked as authored, counted in "where the math stops", and covered by the property tests only as far as its shape (monotonicity, bounds), not its value.
14. THE MCP server SHALL expose both results, and the same functions SHALL be used by the web app.

## Not in scope
- No claim that a band predicts the real outcome. Bands are the model's reading of the stated numbers.
- No requirement levels without a source. Where the pack has none, the answer is "no reference".
- No individual financial, medical or legal advice.
