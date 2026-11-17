---
inclusion: manual
---

# Interview before building (/interview)

Use when the user asks for something to be built and the request names a solution but not the situation, or when earlier attempts have stalled.

1. Ask for the situation in one sentence, in the user's words. Do not propose anything yet.
2. Call `next_question` (MCP server `atamagazon`, pack `devstuck`). Ask the returned question as written. Offer the five answers: yes, probably, I don't know, probably not, no. "I don't know" is a valid answer and is not pressed.
3. Add the answer to the list and call `next_question` again with the full list. Repeat until it reports a stop reason. Never ask more than the budget it returns.
4. Call `diagnose`. Say the top stalls in plain words with hedging. For stalls on the user's side, phrase them as something to check.
5. Offer the top moves, each with its cost and source, and say that each can be declined. Do not start building before the user picks.
6. Write the spec (requirements in EARS form, acceptance criteria). Append a short audit: what the user said first, what you suggested, what they chose.
