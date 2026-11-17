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

- Inspected archived storefronts from 2000 and 2002 with a headless browser. Rebuilt the skin: white page, blue header bars, yellow question box, pale tabs with a blue selected tab, blue sub-nav, brown-orange headings. Kept Halloween to the pumpkin, the stitched wordmark and the Coffin Box.
- Renamed the product to atamagazon (pun on atama-ga-amata). Wordmark is original; no real logo or trade dress.
- Added Movers & Shakers (fitChanges, property-tested), BROWSE as a view filter, expandable items.

- User asked for an assistant in the spirit of old voice assistants and for a psychological approach, and not to reinvent the wheel. Checked claims first (GUS 1977, SiriKit 2016 resolve/confirm/handle, ELIZA and the ELIZA effect, OARS, Web Speech API privacy, localService). Searched GitHub and npm for ELIZA ports: English regex lists or no license, so ideas only. Corrected two of my own claims (on-device speech recognition now exists; the prize of the 2025 ELIZA entry is unconfirmed).
- Wrote .kiro/specs/shopkeeper first. Built normalize, lexicon, evidence, dialogue as pure functions with 16 new tests (50 total). A property test failed once because of how I wrote it (an expression-bodied arrow returned false); the function was fine.
- Drove the page in a headless browser: 19 checks on greeting, reflection, laddering, fallback, confirm-before-cart, summary with memory, language switch, reset.
- A mis-tapped approval rejected one command; reran it unchanged.

- Added an explanation facility after MYCIN's WHY and HOW (spec in .kiro/specs/explain, written first). Property tests: answer probabilities sum to 1; information gain equals prior entropy minus expected posterior entropy; the trace ends at replayBelief; the product of evidence factors equals final over start. 58 tests in total. Ten headless-browser checks pass.
- Mistake to remember: while cleaning up leftover test processes I stopped six node processes without confirming they were mine. They belonged to another app (OpenAI Codex). I told the user. From now on I stop only processes I started and can identify by their exact command line.

- Built the geometry view and the "where the math stops" section (spec in .kiro/specs/geometry, written first). New pure functions: geodesicPoint (constant-speed spherical interpolation), pathLength, countAuthored. 65 tests pass. Twelve headless-browser checks pass, including that the drawn angle equals half the printed distance.
- Mistake to remember: I edited Shop.tsx with the edit tool and with a PowerShell script at the same time. The script's write overwrote the edit tool's change, so the About section was missing. A browser check caught it. I redid the edit alone. From now on one writer per file at a time.
- Label overlap in the figure was found only by looking at the screenshot and fixed by moving the labels.

## 2026-11-17
- User, again: the problem was never mathematics. It is problem solving: engineers who go back and forth with an AI many times and hit a wall; and a teacher would first test the learner's level, which chat AIs do not do. I had drifted toward math twice (a math tool shelf, a quantum-mechanics diagnostic). That was me following the user's stated liking for math instead of the stated problem, the very echo chamber this project is about. Recorded so it is not repeated.
- Read at the source: Laban et al. 2025 (multi-turn degradation), Sharma et al. 2023 (sycophancy), Zeller's TRAFFIC and delta debugging, Golovin et al. 2010 (greedy information gain under noise). Wrote .kiro/specs/dev-stuck-pack first.
- Built the developer-stuck shelf (8 stalls, 17 probes, 12 moves with sources) as a second knowledge pack, and made it the default. Added step status from knowledge-space ideas: done, blocked (do X first), next. Added a lapse rate to the answer model and a minimum of four answers before a confident conclusion. 91 tests pass. 17 headless-browser checks pass.
- Echo-chamber benchmark (npm run bench): fixed the always-yes failure (100% confident in two answers to 0%), did not fix random and off-shelf users (about 43% still stop confident at chance accuracy). Next: a "none of these" hypothesis.
- Two approvals of mine were rejected by mis-tap and rerun at the user's request. A check script of mine had two wrong assumptions; the app was right.
