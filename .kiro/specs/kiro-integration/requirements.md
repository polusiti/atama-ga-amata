# Kiro integration: requirements

Goal: make Kiro itself use the atamagazon examiner while it builds for a user, and make the repo's own development rules executable (hooks, steering, agents) instead of only written down.

## Users
- A person who asks Kiro to build something and cannot say exactly what or why it stalled.
- The maintainer (solo), who needs the knowledge base to stay sourced, non-blaming and consistent.

## Requirements (EARS)

1. WHEN Kiro calls `next_question` with a pack id and a list of answers, THE MCP server SHALL return the unasked probe with the best expected information gain per cost, or a stop reason.
2. WHEN Kiro calls `diagnose`, THE MCP server SHALL return the ranked needs, ranked next moves with their sources, and the fringe status (done, blocked, next) of each move.
3. WHEN Kiro calls `explain` for a need, THE MCP server SHALL return which answers raised or lowered it (HOW) and which probes would still tell it apart from the runner-up (WHY).
4. IF an answer id, pack id or answer value is unknown, THEN THE MCP server SHALL return an error result naming the bad value and SHALL NOT throw.
5. THE MCP server SHALL be stateless: every call carries the full answer list, and the same input SHALL give the same output.
6. THE MCP server SHALL call the same functions as the web app (`src/core`), not a copy.
7. WHEN a file in `src/data/` or `src/core/lexicon.ts` is saved, THE hook SHALL run the knowledge-base tests and report failures to the agent.
8. WHEN a file holding user-facing wording is saved, THE hook SHALL ask the agent to check it against `voice.md` (no AI-style disclaimers, no blame, hedged wording).
9. WHEN the agent finishes a turn that changed code, THE hook SHALL run typecheck and tests.
10. THE `stall-doctor` agent SHALL interview the user with the MCP tools before writing any spec, and SHALL show which of the user's first words and which suggestions led to each choice.
11. THE `kb-reviewer` agent SHALL be read-only and SHALL report moves without a source or an honest "rule of thumb" label, and wording that blames the user.
12. EVERY spec under `.kiro/specs/` SHALL have requirements, design and tasks.
13. THE app SHALL open in English by default and keep Japanese as a switch.

## Not in scope
- No LLM call inside the MCP server. The LLM (Kiro) is the voice; the engine is the examiner.
- No stored user data. No network calls.
