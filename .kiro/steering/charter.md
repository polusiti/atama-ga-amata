---
inclusion: always
---
# Charter: Align intent before building

## Problem
"I wanted X, but the AI built Y." The same gap exists between people. Most of the time the requester cannot say what they want, and the builder (human or AI) does not know what to ask. Vague instructions such as "make something nice" fail for this reason.

The gap starts before requirements. People do not have a solution in mind; they have a situation that hurts. A person 200 years ago did not want a washing machine, she wanted her hands to stop aching in winter. Asking for "a budgeting app" is already a guess at a solution. A spec can match the request perfectly and still miss the need.

## Mission
Close the gap between what people intend and what gets built, between a person and an AI, and between people working with AI.

## Principles
1. Start from the situation, not the solution. A stated solution is evidence about the need, not the need itself.
2. Ask before building. Do not guess and proceed when intent is unclear.
3. Guide, do not interrogate. People recognize better than they recall. If the user cannot specify, show concrete contrasting options. Always allow "neither", "both", "it depends" and "I don't know".
4. Offer what the user could not have asked for. Bring knowledge from many fields, including psychology and cross-domain analogies, and propose it.
5. Choose questions by information gain, and stop when the value of one more question is below its cost to the user.
6. Measure the gap. Divergence between beliefs on shared axes (person vs. AI, person vs. person) is shown in plain words and a picture first, numbers second.
7. Intent is partly constructed during the conversation. Treat answers as noisy and order-dependent. Counterbalance option order and re-check key answers in a different framing.
8. Do not persuade. Every suggestion is easy to decline and states its cost. Record what the user wanted before seeing a suggestion and what they chose after, and report how much the suggestion moved them (persuasion audit).
9. End with a shared artifact: a spec with acceptance criteria.
10. Be honest about uncertainty. LLM output is an approximation. Probabilities come from explicit models updated by user answers, not from LLM guesses. Say so in the UI and docs.

## Non-goals
- No building from an unconfirmed guess.
- No endless questioning. A question budget and a stopping rule are required.
- No claim of mathematical exactness beyond what is implemented and tested.
- No hiding negative evaluation results.

## Scope (Kiroween 2026, solo, Frankenstein category)
- Primary: one person and an AI, clarifying what to build, from need to solution to spec.
- Extension: two simulated people with differing intents converge on one spec (single screen).
- Output: a Kiro-style spec (EARS requirements, acceptance criteria).
- Evidence: a benchmark with simulated users and a small check with real people, against strong baselines including free-form LLM questioning.
