# Explanation facility (WHY / HOW): requirements

Old inference-style AI idea we borrow: MYCIN (Stanford, 1970s) let a user interrupt a consultation to ask WHY a question was being asked and HOW a conclusion was reached. We add the same two questions, answered from our own engine, with exact numbers. No code from any other system.

## Requirements (EARS)

1. WHEN the user opens "Why ask?" next to the current question, THE SYSTEM SHALL show the leading hypotheses with their current probability, how strongly "yes" holds for each, the expected information gain and the cost, and for each possible answer its probability and the leading need after it.
2. THE SYSTEM SHALL compute the answer probabilities and the leading need from the same functions that choose and apply the question, so the preview matches what then happens.
3. WHEN the user opens "Why do you think so?" next to the inferred needs, THE SYSTEM SHALL list the evidence behind the leading need (named solution, free-text words, answers) with the factor by which each item multiplied that need's odds.
4. THE SYSTEM SHALL compute the factors so that their product equals the final probability divided by the starting probability for that need.
5. WHEN the user asks "why" in the shopkeeper window, THE SYSTEM SHALL answer in one sentence naming the two leading needs, or say that no question is pending.
6. THE SYSTEM SHALL hide factors that are practically 1 and show the six largest by absolute effect.
7. THE SYSTEM SHALL use only deterministic rules and the existing belief. No network call.

## Prior art (ideas only)
- MYCIN: backward chaining, certainty factors, WHY and HOW (Buchanan and Shortliffe, 1984). Our numbers are Bayesian, not certainty factors, so the factors multiply exactly.
- Good's weight of evidence: the log of a likelihood ratio, added up as evidence arrives.

## Out of scope
Natural-language generation beyond fixed templates, counterfactual search over many answers.
