# Shopkeeper: design

## Approach
ELIZA-style rules (Weizenbaum 1966), not a language model. Free text is read into a likelihood vector over needs, so it enters the belief the same way an answer does (`src/core/evidence.ts`).

## Pieces
- `normalize.ts`: folds width, case, katakana and punctuation so Japanese and English match the same keyword list. Idempotent (tested).
- `lexicon.ts` / `devstuck.ts`: per pack, weighted keywords per need, aliases for named solutions, and "want markers" ("I want", "ほしい"). A named solution counts only with a want-marker, so "I don't want an app" is not read as a request.
- `evidence.ts`: `readText` returns a bounded likelihood vector. Neutral when nothing matches; ties never pick a top need.
- `dialogue.ts`: confirm before acting ("So ... right?"), then offer fallback chips when nothing matched. Templates rotate so the same line is not repeated. No template claims understanding (tested).

## Why this shape
Notes multiply into the belief, and multiplication commutes, so the order of notes does not matter (tested). The shopkeeper never decides alone: it reflects, asks to confirm, and the user's answer is evidence.

## Limits
Keyword matching misses paraphrase. The sample-sentence test is a regression check, not an accuracy measure.