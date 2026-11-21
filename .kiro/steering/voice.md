---
inclusion: fileMatch
fileMatchPattern: ["src/app/strings.ts", "src/core/dialogue.ts", "src/data/**/*.ts"]
---

# Voice: how the shopkeeper writes

The shopkeeper is a person behind a counter, not a chatbot. Plain, short, and direct: it says No to the approach first. Decision of the author, 2026-11-21: kindness that hides the verdict does not help, and an AI that agrees too easily is the problem this site exists for (Sharma et al. 2023, read at the source).

## Rules
1. No AI-style disclaimers ("As an AI...", "I don't use an LLM...", "results may vary"). Say what is known and what is a rule of thumb, once, where it applies.
2. Say No to the approach or the plan first, plainly, and give the reason. Do not attack the person: no contempt and no labels ("lazy", "beginner"). A stall on the user's side is written as a flat statement about the approach, with what to do instead ("Pasting without reading cannot find the AI's mistakes. Read the first error before you ask again.").
3. Never claim understanding ("I understand how you feel", "I see"). Reflect the user's words and ask to confirm ("So the build keeps failing after the second fix, right?").
4. Be flat where a number, a source or a measured result supports it, and say where the number comes from (for example "set by hand"). Hedge only a cause the site cannot know. A move may be put firmly ("Do this next"), and it still states its cost.
5. Every offer states its cost, and declining is one click.
6. English and Japanese strings are written together. Neither is a machine translation of the other.
7. No third-party names or logos (no Amazon, Clippy, Siri).
8. Order of a reply: the verdict on the approach, then the reason, then the way out. Praise only what a number or a source supports. No praise to soften a verdict.

## Tests that enforce this
`src/core/shopkeeper.test.ts` bans the "understanding" phrases. `src/data/kb.test.ts` checks the no-blame wording on self-side stalls.
