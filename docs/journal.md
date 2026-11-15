# Development journal

Kept for the Kiro write-up. Dates are JST.

## 2026-11-15
- Registered idea: "unify scattered human thoughts and cloud data" (original application text).
- Researched Kiroween 2025 winners. Best Frankenstein was rumorNet. A "digital memory" app (Chimera) won only the blog prize, so the personal-data-unifier idea was dropped.
- Redirected twice by the user: (1) the real problem is intent mismatch between people and AI, (2) people ask for solutions but have situations (the washing-machine point). Both changed the design.
- User noted that no LLM is needed at runtime (Akinator-style). Adopted: deterministic engine, no API cost, reproducible tests.
- Wrote charter and product steering. First vertical slice: math core, 8-need shelf, bilingual UI. 31 tests pass (property-based tests for Fisher-Rao metric axioms, Bayes update, information gain identity).

## Observed misalignment (kept as demo material)
- Assistant answered "go deeper" with an implementation plan the user called shallow (~3 hours of work).
- Assistant proposed "grandma" persona; user preferred a shopkeeper after critique.
- Assistant did not volunteer information geometry; the user did. The proactive-suggestion pillar comes from that.

## 2026-11-15 (later)
- User: the UI looked AI-made. Studied their sites (Windows 98 desktop in labo, 2000s textbook pages in lyceum). Rebuilt as a Win98 wizard, then as a 1999 shop in a browser window after researching early Amazon design (tabs, sidebars, Gold Box).
- User: explanatory microcopy (e.g. a status-bar note about LLMs) read as AI. Moved disclaimers to the About tab and rewrote UI text in a shopkeeper voice.
- Wrote .kiro/specs/shop-ui (requirements, design, tasks) before implementing; added replayBelief with a property test (exact undo).
