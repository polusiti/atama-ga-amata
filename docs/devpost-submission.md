# Devpost submission draft

Status: draft for the author to read and edit. Numbers are from the repository on 2026-11-20 (12 specs, 5 hooks, 7 steering files, 2 custom agents, 5 MCP tools, 188 tests, 18 incident entries, 8 of 17 developer moves that name a source). Nothing here claims a user result, because there is none yet.

Category: Frankenstein
Live site: https://polusiti.github.io/atama-ga-amata/
Repository: https://github.com/polusiti/atama-ga-amata (MIT, `.kiro/` committed)

## Name and one line
**atamagazon**: when the back-and-forth with an AI keeps repeating, it shows the chance that one more try of the same approach works next to the chance that a fresh approach works, and offers exit moves that name a source.

## Inspiration
An antlion pit is a sand trap where each struggle makes the slope slide. Working with an AI can look the same: the same fix, a failure, the same fix again. On the day I built this, my own coding agent sent the same shape of long command again and again. Each one was interrupted, and it read each interruption as bad luck. That is the first case in the incident log, and the first user of the tool.

## What it does
1. You list your recent tries, and mark which used a different approach and which produced a new fact.
2. It shows two numbers side by side: the chance that another try of the same approach works, and the chance that a fresh approach works. After two failures of the same approach, for example, it shows 17% against 20%. Both numbers are set by hand, and the site says so. It does not claim a rule such as "switch after N tries".
3. When a fresh approach has the better chance, it offers up to three exit moves that name a source (Zeller, *Why Programs Fail*; Laban et al. 2025; Sharma et al. 2023). Moves that carry only a rule-of-thumb label are listed apart, labelled. Each move has a spec sheet: the theory, what data exists (none, problem studied, or method published), the cost, and when it may not fit. A source says where a method comes from. It does not show the method works for you.
4. You pick moves into a plan. The plan shows the order by prerequisites, the number of steps, and how many of the moves have any recorded data. You try a move and come back with the result as a new attempt.

You can also type a sentence about a try to the shopkeeper. A small model (Cloudflare Workers AI, behind a Worker in this repository) proposes the two marks, a validator rejects anything outside that shape, and the shopkeeper asks "Add it as a try that did not work?" Nothing is added until you press Yes. If the reader is down or over its limit, the page says so and the marks on the screen still work.

The wording judges the approach, never the person.

The same check is an MCP tool, `pit_check`, so an AI agent can check itself. A steering file tells the agent to call it after two failed tries of the same approach.

## How I built it with Kiro
- **Specs (12).** Every part has requirements in EARS form, a design and tasks, written before the code. The pit slice ("pit-escape") and the exit shop ("exit-shop") are the last two.
- **Steering (7).** `charter`, `product`, `agent-conduct` and `pit-guard` are always on. `voice` and `evidence` apply by file. `interview` is manual. `agent-conduct` is built from the incident log: each of its rules names the incident that caused it, and a rule is added only after the incident is written down.
- **Hooks (5).** Tests run when data is saved (`kb-integrity`). A coverage report lists which causes lack questions, moves or samples, and never fills in numbers (`pack-coverage`). A wording check runs on every saved file with user-facing text (`voice-check`). Typecheck and tests run when the agent stops (`verify-on-stop`). A journal reminder follows a finished spec task.
- **MCP (5 tools).** `list_packs`, `next_question`, `diagnose`, `explain`, `pit_check`. The server is stateless and calls the same functions as the website. I called `pit_check` from the Kiro IDE and it returned the same numbers as the site.
- **Custom agents (2).** `stall-doctor` interviews a person first and only then writes a spec. `kb-reviewer` audits sources and wording and cannot write files.
- **Tests (188).** Property-based tests (fast-check) cover the probability code, plus checks of the data: a spec sheet may exist only for a move that names a source, no sheet may use wording such as "proven" or "effective", every text must exist in both languages, and prerequisites must not form a cycle.

## What is stitched together (Frankenstein)
- A small probability model from restart theory (a two-type task with heavy-tailed run times, where a fresh start beats waiting) with a hand-set, plainly labelled parameter set.
- The honesty of a good teacher or doctor: say plainly that a plan does not fit, never blame the person, and leave the decision to them.
- A deterministic engine that produces every number and ranking, with a small language model used in one place only: it proposes two marks from a typed sentence, a validator throws away anything outside that shape, and nothing counts until the person says Yes. The numbers cannot drift or flatter the user, because the model never produces them.
- A storefront from around 2000 inside a Windows 98 browser window, with an original pixel ghost as the shopkeeper.
- Kiro hooks, steering and specs driven by a log of the builder's own mistakes, and an MCP tool the builder's own agent is told to call.

## Challenges
- Scope. The first version tried to diagnose twelve kinds of stall and judge fit for any plan. Fit judgement needs sourced requirement levels and a calibrated item bank, and neither exists, so it is parked in the code. The site now does one thing.
- Honest numbers. Across 81 parameter sets, the point where the verdict turns to "switch" ranged from 0 to 7 failures, or never. That is why the site shows two numbers and not a count.
- The agent that built it made the same mistakes twice (parallel edits to one file, long commands repeated after an interruption). Each is in the incident log, and the second one produced the pit-guard steering file.

## What I learned
Putting the builder's own failures into the product made the product more specific, and made the steering files shorter, because each rule has a cause.

## Honest limits
- No real user has tried it. There is no data on whether the exit moves help a person who is stuck.
- The two pit numbers are set by hand, not measured.
- Of 17 developer moves, 8 name a source and 9 are rules of thumb. Even a sourced move carries at most "method published" or "problem studied", never "works here".
- The "new fact" mark is shown and counted, but it does not enter the calculation.
- The sentence reader is weak where it matters. On 20 hand-written sentences per language, it found a repeated approach 10 times out of 10 in both languages, but a new approach only 4 out of 10 in English and 3 out of 10 in Japanese. For the "new fact" mark, it often invented a yes or no when the sentence did not say (6 of 8 in English, 5 of 8 in Japanese). That is why its proposal is a question, and the marks on the screen stay in charge. The set is small and written by the author.
- A language model also helped write and review the data, and Kiro built the code.

## What is next
Ask a few developers who are stuck to use it on a real case, and record whether the verdict and the exit moves matched what they did next. Set the numbers from that, not by hand.
