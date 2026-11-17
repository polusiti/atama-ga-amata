# Dev-stuck pack: requirements

The problem is problem solving. An engineer and an AI go back and forth many times and hit a wall. Chatting more does not help, because the conversation itself has become the trap.

What a good teacher or senior engineer does first is find out where the person is: which practices are already in place, which are missing. Then they propose the next step at the edge of what the person can do, and bring in a view from outside the conversation. This pack does that.

## Evidence we build on (read at the source)

- Laban et al. 2025, "LLMs Get Lost In Multi-Turn Conversation" (arXiv:2505.06120): across six tasks the average performance drop in multi-turn conversations was 39%. Models often make assumptions early, try to give a final solution too soon and then over-rely on it. When they take a wrong turn they do not recover.
- Sharma et al. 2023, "Towards Understanding Sycophancy in Language Models" (arXiv:2310.13548): AI assistants tend to match the user's views over truthful ones.
- Zeller, "Why Programs Fail": systematic debugging as Track, Reproduce, Automate, Find origins, Focus, Isolate, Correct (TRAFFIC). Delta debugging for "worked yesterday, not today".
- Not used as fact: advice from blog posts such as "restart after two failed corrections". It may appear as a rule of thumb, labeled as such.

## Requirements (EARS)

1. THE SYSTEM SHALL offer more than one shelf (knowledge pack) and start on the developer-stuck shelf. Everything shown (needs, questions, solutions, sample sentences, texts) SHALL come from the selected pack.
2. WHEN the user answers a probe that asks about a concrete practice, THE SYSTEM SHALL record that the practice is in place if the answer is "yes" or "probably", so the same advice is not given as a new step.
3. THE SYSTEM SHALL show each step as one of: "already in place", "blocked: do X first", or "next step". A step is blocked when a step it requires is not yet in place. The next steps are the not-yet-in-place steps whose requirements are all in place (the outer fringe).
4. THE SYSTEM SHALL rank next steps by expected fit under the current belief.
5. THE SYSTEM SHALL phrase probes as facts about the last exchanges (what was passed to the AI, what came back), include reverse-keyed probes, and avoid asking the user to judge themselves.
6. THE SYSTEM SHALL bound the evidence of any single answer by a lapse rate (a share of answers is random regardless of the truth), so that two agreeable answers cannot produce near certainty.
7. THE SYSTEM SHALL not declare a confident conclusion before four answers.
8. THE SYSTEM SHALL output a ready-to-use plan (numbered steps) instead of a software spec when the pack is about problem solving.
9. EVERY step SHALL state its cost and its source, or say "rule of thumb, not tested".

## Out of scope
Calling an LLM, reading the user's real chat logs, scoring a person's ability.
