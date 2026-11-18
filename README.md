# atamagazon (atama-ga-amata)

Kiroween 2026, Frankenstein category (solo, student).

**atamagazon** is a pun on the repository name atama-ga-amata ("many heads"). It is a department store for troubles, styled after online storefronts around 2000, shown inside a Windows 98 browser window.

## The one job: out of the antlion pit
An antlion pit is a trap where each struggle makes the slope slide. In a back-and-forth with an AI it is repeating the same approach, failing, and trying it again. The site does one thing about it:
1. You list your recent tries, and mark which used a different approach and which produced a new fact.
2. It shows two numbers side by side: the chance that one more try of the same approach works, and the chance that a fresh approach works. Both are set by hand, not measured, and it does not say "switch after N tries".
3. When a fresh approach has the better chance, it offers at most three exit moves that name a source (Zeller, Laban et al. 2025, Sharma et al. 2023). Rule-of-thumb moves are listed apart and labelled. Each move has a spec sheet: theory, what data exists (none, problem studied, or method published), cost, and when it may not fit. A source says where a method comes from. It does not show the method works for you.
4. You choose, add moves to a plan (the shop checks order and missing prerequisites), try them, and come back with the result as a new attempt.

The same check is available to an AI agent as the MCP tool `pit_check`, and `.kiro/steering/pit-guard.md` tells the agent to call it after two failed tries of the same approach. The first real case is in `docs/incidents.md` (INC-17): the agent that built this product sent the same shape of long command again and again. Under the hand-set numbers, the tool says switch from the second same-approach failure. The exact count of repeats is unknown, so that is a sensitivity table and not a measurement.

The wording judges the approach, never the person.

## The problem

You and an AI have gone back and forth many times and the work has stopped moving. More chatting does not help, because the conversation itself is the trap: failed attempts pile up, the same ideas return, and the AI tends to agree with you (see the sources below). A good teacher or senior engineer would first find out where you actually are, and then propose the next step at the edge of what you already do, with a view from outside the conversation.

The default shelf does that for developers. It asks about concrete practices ("can you trigger it with the same steps every time?", "did you check the AI's answer against anything but the AI?"), finds which practices are already in place, and shows the next move: steps you already do are marked done, steps whose prerequisite is missing say what to do first, and the rest are next moves. Every move shows its cost and its source, or says "rule of thumb, not tested".

A second shelf ("everyday troubles") shows the same engine on a different domain: people ask for a solution (Y) when what hurts is a situation (X).

## Evidence the shelf is built on (read at the source)

- Laban et al. 2025, "LLMs Get Lost In Multi-Turn Conversation" (arXiv:2505.06120): average performance drop of 39% in multi-turn conversations; models make early assumptions and do not recover from wrong turns.
- Sharma et al. 2023, "Towards Understanding Sycophancy in Language Models" (arXiv:2310.13548): AI assistants tend to match the user's views over truthful ones.
- Zeller, "Why Programs Fail": systematic debugging (TRAFFIC: Track, Reproduce, Automate, Find origins, Focus, Isolate, Correct) and delta debugging.
- Golovin, Krause and Ray 2010 (arXiv:1010.3091): with noisy answers, greedy information gain can perform poorly. This is why we measure the engine instead of trusting it (see `docs/benchmark.md`).

## How it works

No LLM runs at runtime. The engine is a small, deterministic, tested core:

- Belief over underlying needs, updated by Bayes with an explicit answer model (5 graded answers, a fixed "don't know" share, Gaussian noise).
- Next question chosen by exact expected information gain (mutual information) per unit of user effort. Stops when another question is worth less than it costs.
- A stated solution is noisy evidence about the need, not the need itself.
- The gap between your stated solution and the inferred need is the Fisher-Rao distance, `2 * arccos(sum sqrt(p_i q_i))`.
- Persuasion audit: shows what you named first, what the shop suggested and what you chose.

See `.kiro/steering/charter.md` for the principles and `docs/assumptions.md` for what is authored judgment rather than measured data.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # property-based tests (fast-check) and KB integrity
npm run bench    # echo-chamber benchmark, writes bench/results/echo-probe.txt
npm run build
```

Deploys to Vercel as a static Next.js app. No environment variables, no database.

## Layout

- `src/core/` pure math and engine (no I/O)
- `src/data/kb.ts` the shelf: needs, questions, solutions (Japanese and English)
- `src/app/` UI
- `.kiro/` steering and specs used to build this with Kiro
- `docs/journal.md` development journal

## License

MIT


## Prior art and credits

- ELIZA (Weizenbaum, 1966): keyword rank, templates, a fallback when nothing matches, and a memory of an earlier statement. The recovered original source was released CC0 (ELIZAGEN). We borrowed the ideas only. The English ELIZA ports found on GitHub were unlicensed or English-only regex lists, so none was reused.
- GUS (Bobrow et al., 1977) and SiriKit's resolve, confirm, handle flow: ask for what is missing and confirm before acting.
- Motivational interviewing (Miller and Rollnick): phrasing of open questions, reflections and summaries. No claim of effect.
- 98.css (MIT) for the Windows 98 widgets.
- MYCIN (Stanford, 1970s): the WHY and HOW explanation facility. Our 'Why ask?' and 'Why do you think so?' follow the idea; the numbers are Bayesian, so odds multipliers multiply exactly to the result. No code was taken.

## Honest limits
- The two pit numbers (24%, 12%, 20% and so on) come from a two-type model with four constants set by hand (`PIT_PARAMS` in `src/core/pit.ts`). Across 81 sets of constants the point where the verdict turns to "switch" ranged from 0 to 7 failures, or never. The site therefore shows the numbers and does not state a rule.
- No real user has used it yet. There is no data on whether the exit moves help a person who is stuck. Of 17 developer moves, 8 name a source and 9 are rule-of-thumb. Even the sourced ones carry the level "method published" or "problem studied" at most, never "works here".
- The "new fact" mark is shown and counted but does not enter the calculation.
- Exit moves are ranked by the answers given in the shop. Without answers, the ranking follows the prior.
- Fit judgement (whether a plan suits a person) is parked: it needs sourced requirement levels and a calibrated item bank, and neither exists.
- No LLM runs on the site. An LLM was used to write and review the data, and Kiro built the code.

## Mathematics, with a confession

- **Geometry view.** The gap between your named idea and the current estimate is drawn as an arc on a quarter circle. The arc angle is exactly half the Fisher-Rao distance (two points on a sphere always share a plane through its center, so nothing is distorted). A browser test checks the drawn angle against the printed distance.
- **Where the math stops.** The About page lists what is computed, what the author set by hand (230 numbers, counted from the data), and what mathematics cannot decide.

## How Kiro is used

Kiro is the builder and the voice. The examiner is a deterministic engine that Kiro reaches through MCP, because an LLM tends to agree with the person (Sharma et al. 2023) and does not test their level.

| Kiro feature | What it does here |
|---|---|
| Specs | Every part has requirements, design and tasks in `.kiro/specs/` and was written before the code. |
| Steering | `charter.md`, `product.md`, `agent-conduct.md`, `pit-guard.md` (always); `voice.md`, `evidence.md` (by file); `interview.md` (manual, `/interview`). `agent-conduct.md` is written from the incidents in `docs/incidents.md`, each rule naming the incident that caused it. |
| MCP | `mcp/server.ts` exposes `list_packs`, `next_question`, `diagnose`, `explain`, `pit_check`. Stateless, same functions as the web app. Registered in `.kiro/settings/mcp.json`. Check: `npm run test:mcp`. |
| Hooks | `kb-integrity` (tests on data save), `pack-coverage` (reports which needs lack probes, moves, words or samples; reports only, never fills in numbers), `voice-check` (agent reviews wording), `verify-on-stop` (typecheck and tests), `journal-reminder` (after a spec task). |
| Custom agents | `stall-doctor` interviews first and then writes a spec; `kb-reviewer` is read-only and audits sources and blame wording. `npm run check:kiro` checks the hook, agent and MCP files against the names the IDE itself accepts. |
| Property-based tests | fast-check over the geometry and belief updates (`src/core/*.test.ts`). |

Not used: Powers, Kiro CLI/Web/Crew (the work was done in the IDE).
