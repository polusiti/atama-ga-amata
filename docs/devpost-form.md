# Devpost form: text to paste (draft)

Status: draft for the author to edit. Counts come from the repository on 2026-11-21 (17 specs, 5 hooks, 7 steering files, 2 custom agents, 18 incident entries, 21 check items). The shake feature (the third AI use) is built but its Japanese path does not work yet; this text says so and must be updated when that is settled. Nothing here claims a result from a real user, because there is none yet.

## Project name (max 60 characters)
Why are you stuck on AI?

(Alternative that keeps the product name: `atamagazon: get out of the AI loop`)

## Elevator pitch (max 200 characters)
Stuck repeating the same fix with your AI? A midnight-shop ghost says No to the approach, not to you, shows the odds of one more try vs a fresh start, and gives ten-minute ideas to leave the loop.

(196 characters, counted by script. The limit is 200.)

## Built with
TypeScript, Next.js (static export), React, 98.css, GitHub Pages, Cloudflare Workers, Cloudflare Workers AI (Llama 3.2 3B, Llama 3.3 70B), Model Context Protocol, fast-check, Vitest, Playwright, Kiro (specs, steering, hooks, custom agents, MCP)

## Try it links
- https://polusiti.github.io/atama-ga-amata/
- https://github.com/polusiti/atama-ga-amata

## Project story (paste into "About the project")

### Inspiration
An antlion pit is a sand trap: each struggle makes the slope slide. Working with an AI can look the same. You give the same fix, it fails, you give the same fix again. On the day I built this, my own coding agent sent the same shape of long command again and again. Every one was interrupted, and it read each interruption as bad luck. That is the first entry in the incident log, and the first user of the tool.

Two papers made me take the pattern seriously. Sharma et al. (2023) report that AI assistants tend to agree with the user. Laban et al. (2025) report that models do worse in multi-turn conversations than in a single turn. Both say that more of the same conversation is not a safe bet.

### What it does
You tell a shopkeeper about your tries. The site shows two numbers side by side: the chance that another try of the same approach works, and the chance that a fresh approach works. Both numbers are set by hand, and the page says so. When the fresh approach wins, the verdict starts with No to the approach ("this approach is done") and never blames the person. Then it gives a way out:

- Exit moves that name a source (for example Zeller, *Why Programs Fail*), each with its cost and when it does not fit. A source says where a method comes from. It does not say the method works for you.
- Five ideas of different kinds, each with a ten-minute test. A language model writes them. Fixed rules reject any answer that is the wrong shape, too samey, or claims it ran something.
- A short check of what you know (Docker, MCP, Git, HTTP, spotting an AI's mistake, reading code, reading tests). Questions have answers. There is no score, and a miss never becomes a label on you. For the code and test questions, I ran every snippet to confirm the answer key.

The same check is an MCP tool, `pit_check`, so an AI agent can check itself. A steering file tells my own agent to call it after two failed tries of the same approach.

### How I built it
Kiro drove the build:

- **Specs (17).** EARS requirements, design and tasks before the code, for each part.
- **Steering (7).** `agent-conduct` is built from the incident log: each rule names the incident that caused it, and a rule is added only after the incident is written down. `pit-guard` came from the second repeat of the same mistake. `voice` sets the wording rule: say No to the approach, never to the person.
- **Hooks (5).** Tests on data save, a coverage report, a wording check on every saved file with user-facing text, typecheck and tests when the agent stops, a journal reminder.
- **MCP (5 tools).** The server is stateless and calls the same functions as the website. I called `pit_check` from the Kiro IDE and it returned the same numbers as the site.
- **Custom agents (2).** `stall-doctor` interviews a person before it writes a spec. `kb-reviewer` audits sources and wording, and cannot write files.
- **Property-based tests.** fast-check on the probability code, plus checks on the data (no wording such as "proven", every text in both languages, no cycles in prerequisites).

The numbers come from a deterministic core. A language model is used in bounded places only, and it never produces a number. A Cloudflare Worker with Workers AI reads a typed sentence (a validator throws away anything outside the shape, and nothing counts until you press Yes) and writes the five ideas.

### What is stitched together (Frankenstein)
A restart-theory probability model, a ghost shopkeeper in a midnight shop (the look is still a Windows 98 browser skin until the redesign lands), a language model held inside fixed rules, a knowledge check with answer keys verified by running code, and Kiro hooks and steering built from the log of the builder's own mistakes.

### Challenges
- Scope. The first version tried to diagnose twelve kinds of stall. That needs sourced requirement levels and a calibrated item bank, and neither exists. It is parked in the code, and the site does one thing.
- Honest numbers. Across 81 parameter sets, the point where the verdict turns to "switch" ranged from 0 to 7 failures, or never. That is why the site shows two numbers and not a count of "allowed" tries.
- The model catalogue lists models that are dead. Two Llama 3.1 8B models were listed but deprecated, so I measured the live Worker and moved to others.
- Randomness. I added a "shake" feature that asks a model for three provocations from two random seed words. English passed in the two live calls I made. Japanese returned an empty text or the wrong language in 13 of 13 calls, so Japanese uses the author's deck of 25 provocations and the page says "from the deck".

### What I learned
Putting the builder's own failures into the product made the product more specific, and made the steering files shorter, because each rule has a cause. I also learned to measure the live model before trusting its documentation.

### Honest limits
- No real user has tried it yet. There is no data on whether the exit moves help a person who is stuck.
- The two pit numbers are set by hand, not measured.
- Of 17 developer moves, 8 name a source and 9 are rules of thumb. Even a sourced move carries at most "method published" or "problem studied".
- The sentence reader is weak where it matters. On 20 hand-written sentences per language it found a repeated approach 10 of 10 in both languages, but a new approach only 4 of 10 in English and 3 of 10 in Japanese. That is why its output is a question to you and not a decision.
- The idea burst passed the fixed rules 8 of 8 in English and 6 of 8 in Japanese on 8 situations per language (median 10 s English, 15 s Japanese). The sets are small and written by the author.
- A language model helped write and review the data, and Kiro built the code.

### What is next
Ask a few developers who are stuck to use it on a real case, and record whether the verdict and the exit moves matched what they did next. Set the numbers from that.

## Additional info (for judges)

### How the project meets the key technical requirement (Kiro use)
Kiro is the builder and the method.
- Specs: 17 under `.kiro/specs/`, each with requirements, design and tasks.
- Steering: 7 files under `.kiro/steering/` (`charter`, `product`, `agent-conduct`, `pit-guard`, `voice`, `evidence`, `interview`).
- Hooks: 5 under `.kiro/hooks/` (data tests, coverage, wording check, verify on stop, journal).
- MCP: `.kiro/settings/mcp.json` runs the `atamagazon` server with 5 tools. The agent is told by `pit-guard` to call `pit_check` after two failed tries.
- Custom agents: `stall-doctor` and `kb-reviewer` under `.kiro/agents/`.
- Property-based tests: fast-check, run by `npm test`.
`.kiro/` is committed and not in `.gitignore`.

### Existing code or work used
None from earlier repositories. This is a new project. Standard open-source libraries only (Next.js, React, 98.css, Vitest, fast-check, Playwright, Wrangler, zod, tsx). The pixel ghost and all text are original. The Windows 98 look uses 98.css and does not use any Microsoft assets.

### Testing instructions for judges
No login. Open the site, press the first choice at the entrance, and follow the shopkeeper.
1. Add three tries that used the same approach and failed. The verdict turns to "switch" and shows both numbers.
2. Press "Get ideas". Five ideas appear in 10 to 30 seconds. If the Worker is over its limit, the page says so.
3. Open CHECK and answer a few questions.
The AI parts run on a free tier with a rate limit, so they can fail. The page says so and the rest keeps working. Run `npm install`, `npm test`, `npm run check:kiro` for the checks.

## Form answers that need the author
- Country of residence: Japan (already set).
- Category: Frankenstein (already set).
- Best Student Project: Frankenstein. Needs LinkedIn profile, student email, year and degree, school name. I cannot supply these. Check the Devpost rules for what proof is accepted.
- Kiroween 2025 registration: No. Submitter type: Individual. AWS employee: No.
- Bonus prizes: Social Blitz needs a post URL that starts with `#KiroweenHackathon26`. Blog prize needs a public post about Kiro written in the submission period. Both are optional and not done.
- Demo video: YouTube, public or unlisted, under 3 minutes (only the first 3 minutes are judged). Not recorded yet.
- Image gallery: JPG/PNG/GIF, 5 MB max, 3:2 ratio, up to 15. Screenshots not made yet.
