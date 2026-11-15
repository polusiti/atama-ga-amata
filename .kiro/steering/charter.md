---
inclusion: always
---
# Charter: Align intent before building

## Problem
"I wanted X, but the AI built Y." The same gap exists between people. Most of the time the requester cannot say what they want, and the builder (human or AI) does not know what to ask. Vague instructions such as "make something nice" fail for this reason.

## Mission
Close the gap between what people intend and what gets built, between a person and an AI, and between people working with AI.

## Principles
1. Ask before building. Do not guess and proceed when intent is unclear.
2. Guide, do not interrogate. If the user does not know how to specify, show concrete contrasting options and let them choose.
3. Choose questions by information gain. Ask the question whose answer is expected to move the belief about intent the most. Stop asking when the belief is concentrated enough.
4. Measure the gap. Divergence between beliefs (person vs. AI, or person vs. person) is a number the user can see.
5. End with a shared artifact. Converged intent is written as a spec with acceptance criteria.
6. Be honest about uncertainty. LLM-estimated probabilities are approximations, not calibrated posteriors. Say so in the UI and docs.

## Non-goals
- No building from an unconfirmed guess.
- No endless questioning. A question budget and a stopping rule are required.
- No claim of mathematical exactness beyond what is implemented and tested.

## Scope (Kiroween 2026, solo, Frankenstein category)
- Primary: one person and an AI, clarifying software requirements.
- Extension: several people with differing intents converge on one spec.
- Output: a Kiro-style spec (EARS requirements, acceptance criteria).
- Evidence: a small experiment comparing results with and without guided questions.
