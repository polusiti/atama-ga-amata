---
inclusion: always
---
# Product: atama-ga-amata

"Many heads" (atama ga amata): each person, and the AI, holds a different picture of the same goal. The system makes those pictures visible and brings them together.

## Core loop
1. Take a vague goal.
2. Generate candidate interpretations of the intent, each with a probability (the belief).
3. Pick the next question or the next contrasting options that move the belief the most (expected information gain; distance measured by KL / Fisher metric on the belief).
4. Update the belief with the answer. Repeat until the stopping rule fires.
5. Emit a spec (EARS requirements and acceptance criteria).

## Frankenstein pitch (what is stitched together)
- Information geometry and Bayesian experimental design (math)
- LLM interpretation and question generation
- Multi-party agreement
- Kiro spec-driven development as the output format

## Rules for work in this repo
- This project is new for Kiroween 2026. Do not import code from earlier repositories.
- Demo data is synthetic. Never commit private notes, personal data, secrets or tokens.
- Keep scope small: one vertical slice that works end to end beats many half features.
- The `.kiro/` directory must stay committed. Never add it to `.gitignore`.
