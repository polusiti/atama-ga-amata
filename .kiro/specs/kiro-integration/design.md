# Kiro integration: design

## Split of roles
Kiro (LLM) talks to the person and writes code. The engine decides what to ask and what the answers imply. The reason: an LLM tends to agree with the person (Sharma et al. 2023, arXiv:2310.13548) and does not test their level. The engine has an explicit answer model, so its confidence can be checked in a benchmark.

## MCP server (`mcp/`)
- `mcp/tools.ts`: pure handlers `(input) => result`. They import from `src/core` and `src/data/packs`. No I/O. Unit-tested with vitest.
- `mcp/server.ts`: stdio server (`@modelcontextprotocol/sdk`) that registers the handlers with zod-free JSON schemas. Run with `tsx`.
- Input shape shared by all tools: `{ pack: "devstuck" | "everyday", answers: [{ qid, answer }], stated?: string }`.
- Tools: `list_packs`, `next_question`, `diagnose`, `explain`.
- Errors come back as `{ isError: true, content: [text] }`.
- Registered in `.kiro/settings/mcp.json`:
  `command: "npx", args: ["tsx", "mcp/server.ts"]`. `autoApprove` lists the read-only tools, because they have no side effects.
- `npm run test:mcp` starts the server over stdio with the SDK client and calls every tool once.

## Hooks (`.kiro/hooks/*.json`, schema v1)
| Name | Trigger | Action | Why |
|---|---|---|---|
| kb-integrity | PostFileSave on `src/data/*.ts`, `src/core/lexicon.ts` | command: `npx vitest run src/data src/core/fringe.test.ts` | A bad `requires` cycle or a missing id breaks advice silently. |
| voice-check | PostFileSave on `src/app/strings.ts`, `src/core/dialogue.ts`, `src/data/*.ts` | agent prompt | Wording rules are judgement, so an agent checks them against `voice.md`. |
| verify-on-stop | Stop | command: typecheck and tests | Catches breakage at the end of every turn. |
| journal-reminder | PostTaskExecution | agent prompt | Keeps `docs/journal.md` current for the write-up. |

## Steering
- `charter.md`, `product.md`: always (existing).
- `voice.md`: fileMatch on strings/dialogue/data. Banned phrases, no-blame rule, hedging, shopkeeper tone.
- `evidence.md`: fileMatch on `src/data/**`. Every move needs a source or the "rule of thumb, not tested" label. Numbers authored by hand are counted in the "where the math stops" panel.
- `interview.md`: manual (`/interview`). How to run the stall interview with the MCP tools.

## Custom agents (`.kiro/agents/`)
- `stall-doctor`: tools `read`, `@atamagazon`. Resources: steering files. Interviews first, then hands over a spec draft.
- `kb-reviewer`: tools `read` only. Audits `src/data/**` against `evidence.md` and `voice.md`.

## Risks
- MCP SDK or hook schema changes: pinned SDK version; hooks follow the v1 schema in the Kiro docs read on 2026-11.
- `tsx` start-up time on first call: acceptable for an interview.
