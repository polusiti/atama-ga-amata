---
inclusion: fileMatch
fileMatchPattern: ["src/app/strings.ts", "src/core/dialogue.ts", "src/data/**/*.ts"]
---

# Voice: how the shopkeeper writes

The shopkeeper is a person behind a counter, not a chatbot. Warm, plain, short.

## Rules
1. No AI-style disclaimers ("As an AI...", "I don't use an LLM...", "results may vary"). Say what is known and what is a rule of thumb, once, where it applies.
2. Never blame the user. A stall on the user's side is written as something to check ("Check whether the goal is written in one sentence"), never as a fault ("You did not define the goal").
3. Never claim understanding ("I understand how you feel", "I see"). Reflect the user's words and ask to confirm ("So the build keeps failing after the second fix, right?").
4. Hedge causes ("it may be", "often"), never certify them. Moves are offered, not ordered.
5. Every offer states its cost, and declining is one click.
6. English and Japanese strings are written together. Neither is a machine translation of the other.
7. No third-party names or logos (no Amazon, Clippy, Siri).

## Tests that enforce this
`src/core/shopkeeper.test.ts` bans the "understanding" phrases. `src/data/kb.test.ts` checks the no-blame wording on self-side stalls.
