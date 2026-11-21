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

A language model is used in two places only, both on the pit screen and neither able to change a number (see "The sentence reader" and "Ideas when stuck" below). Everything that produces a number or a ranking is a small, deterministic, tested core:

- Belief over underlying needs, updated by Bayes with an explicit answer model (5 graded answers, a fixed "don't know" share, Gaussian noise).
- Next question chosen by exact expected information gain (mutual information) per unit of user effort. Stops when another question is worth less than it costs.
- A stated solution is noisy evidence about the need, not the need itself.
- The gap between your stated solution and the inferred need is the Fisher-Rao distance, `2 * arccos(sum sqrt(p_i q_i))`.
- Persuasion audit: shows what you named first, what the shop suggested and what you chose.

See `.kiro/steering/charter.md` for the principles and `docs/assumptions.md` for what is authored judgment rather than measured data.

## The sentence reader (the first place a language model is used)
On the pit screen, you can type a sentence to the shopkeeper, such as "I added logging and found the input is empty". A small language model (Cloudflare Workers AI, `llama-3.2-3b-instruct`, behind a Worker in `worker/`) proposes two marks: whether the try used a different approach, and whether a new fact turned up. Each mark is true, false or "cannot tell". Anything else it says is thrown away by a validator (`src/core/reader.ts`, with property tests), and the page checks the answer again. The proposal is shown as a question, and nothing is added until you press Yes. The numbers, the verdict and the exit moves never come from the model. If the reader is down, slow or over its limit, the page says so and the marks on the screen still work. The Worker accepts requests only from the site's own origin, limits request length and rate, runs on the Free plan (use above the daily allowance fails instead of being billed) and does not log the typed text.

**Measured, 2026-11-20, 20 hand-written sentences per language, labels fixed before the run** (`worker` called live, temperature 0):

| | English | Japanese |
|---|---|---|
| "Different approach" mark: right / wrong / could not tell | 14 / 5 / 1 | 13 / 3 / 4 |
| of the 10 sentences describing the same approach | 10 of 10 right | 10 of 10 right |
| of the 10 sentences describing a different approach | 4 of 10 right | 3 of 10 right |
| "New fact" mark, on the 12 sentences that say something about it: right / wrong / could not tell | 8 / 4 / 0 | 6 / 2 / 4 |
| "New fact" mark, on the 8 sentences that say nothing about it: said "cannot tell" | 2 of 8 | 3 of 8 |
| Failed or invalid answers | 0 of 20 | 0 of 20 |

Reading of the numbers: the reader is reliable at spotting a repeated approach and weak at spotting a new one, and it often invents a yes or no for the new-fact mark when the sentence does not say. That is why the proposal is a question and the marks on the screen stay in charge. The set is small and hand-written by the author, so these are rough figures, not an accuracy claim.

## Ideas when stuck (the second place a language model is used)
When the verdict says a fresh approach has the better chance, "Get ideas" asks for five ideas. The person writes in a sentence or two what is stuck, and a larger model (Cloudflare Workers AI, `llama-3.3-70b-instruct-fp8-fast`, behind the same Worker) returns five ideas, each with a title, what to do, and a quick test: something to do in about ten minutes, and what result would speak for or against the idea. The point is a spread, not a correct answer, because the pit is the repetition of one approach. Correctness is found by the person, by the quick test.

What is checked, by fixed rules in `src/core/ideas.ts`, before anything is shown: exactly five ideas; every field present and within its length; each idea's kind is the id of one of the site's own exit moves, or "other" for at most one idea; no two ideas of the same kind and at least three of the five are exit moves; no repeated title; no claim of having run or tested code, no code block, no URL, no AI disclaimer; and the language asked for (a Japanese answer must contain Japanese). The worker may cut a text that is too long to its limit at the end of a sentence, because a long idea is not a bad idea. An answer that breaks any other rule is not shown, and the page says so in one line while the exit moves with sources stay on the screen. The fixed rules do not check that an idea is good.

Each idea carries a label: a move with a source (with the source), a rule of thumb, or "the model's own idea, no source". The sentence the person types is sent to Cloudflare, not stored, and not logged.

**Measured, 2026-11-21, 8 situations per language, written before the run, called live:**

| | English | Japanese |
|---|---|---|
| Answers that pass the fixed rules | 8 of 8 | 6 of 8 |
| Median and longest time | 10 s and 15 s | 15 s and 24 s |
| Distinct kinds in a passing answer | 5 of 5 | 5 of 5 |

The two Japanese answers that did not pass were stopped by the rules (the model answered in the wrong language, as far as I know; the reason was not recorded in this run). An earlier run of the Japanese half, before the language rule existed, showed 8 of 8, and that number is withdrawn: it let English answers through. In the same series, the smaller model I tried first (`llama-3.2-3b-instruct`) passed the rules every time but gave shallow ideas, and the larger one wrote too long and was cut to fit.

**What I think of the ideas, as the author:** they are uneven. In the examples I read, an idea for a login cookie problem named the cookie, the domains and the places to look; an idea for a test that passes locally and fails in CI used generic nouns and did not mention the difference between the two. No score of quality is claimed.

## The knowledge check
The CHECK tab asks questions that have an answer, in the form "choose the wrong statement": five statements, one of them wrong, plus "I don't know". There are seven areas (Docker, MCP, Git, HTTP, spotting mistakes in an AI's reply, reading JavaScript code, and reading tests), three questions each at levels 1 to 3, and a person sees at most two per area. The code and test questions show a snippet, and each answer key was checked by running the snippet (`npm run check:keys`, Node v22, 2026-11-21). The first question is at level 2. A right answer leads to level 3, and a wrong answer or "I don't know" leads to level 1. After every answer, the page shows which statement was wrong, why, and the source (the documentation page or paper it rests on, with the date it was read, 2026-11-20). The result is a guide per area ("looks in place", "partly in place", "worth reading first") with links to read, never a score. The pit screen then lists those links under the exit moves. The numbers and the ranking of the exit moves do not change because of the check. No language model is involved, nothing is stored or sent, and it can be stopped at any point.

Limits: the 21 questions and their answer keys were written by the author's AI assistant from the documentation named in each item (the code and test questions were also checked by running them), and no human expert has reviewed them yet. The levels are set by hand and are not calibrated. There is no data on whether the check helps anyone.

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
- A language model reads one typed sentence on the pit screen and nowhere else (see "The sentence reader"). It was also used to write and review the data, and Kiro built the code.

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
