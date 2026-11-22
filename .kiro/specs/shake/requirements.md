# Shake: requirements

Decision (2026-11-21, by the user): even if it is wild, the site needs a way out of the loop. A language model should say things that depend little on the context. The current screen is too cluttered, so the site becomes a chat with choices (see `chat-screen`).

Principle (one sentence): a person locked into one context is helped by a provocation that does not depend on that context, so it comes from outside the lock.
Why it may work (read at the source, 2026-11-21): models that take a wrong turn in a conversation tend not to recover (Laban et al. 2025), and a person repeating one approach is in the same kind of lock. Restarting a search from outside its current state is how heavy-tailed searches get unstuck (Gomes and Selman). That a wild provocation helps a stuck developer is NOT shown by anything here. The page says so.
Checked against other fields: a writer stuck on a chapter who is told "describe the scene as the room would" (a prompt that knows nothing about the chapter); a coach who tells a stuck climber "come down, and try the other face".

## Requirements (EARS)
1. WHEN the verdict is "switch", THE chat SHALL offer "Shake it". WHEN chosen, it shows three provocations, each with a title, one concrete action, and a time box of 1 to 10 minutes.
2. THE provocations SHALL NOT depend on the person's problem. THE page SHALL send the worker only the language and the number of same-approach failures. It SHALL NOT send any text the person typed.
3. THE worker SHALL ask the model for exactly three provocations that work for any stuck problem. To vary the answers, the worker SHALL give the model two seed words drawn at random from a fixed list, as a spark for the images (the list is in the repository).
4. THE answer SHALL pass fixed rules before it is shown: exactly three; each has `title` (at most 40 characters), `how` (at most 140 characters) and `minutes` (an integer from 1 to 10); no two titles the same; no claim of having run, tested or checked anything; no code block; no URL; no AI disclaimer; and the language asked for. The worker MAY cut a text that is too long to its limit at the end of a sentence. The page SHALL NOT cut anything and SHALL check again.
5. WHEN the model is down, slow (more than 30 seconds), over its limit, or its answer breaks a rule, THE page SHALL draw three provocations from a fixed deck written by the author (at least twenty, both languages), at random, and SAY that they came from the deck. The deck SHALL pass the same rules in a test.
6. THE page SHALL say once: these are provocations, not answers; the point is to break the lock; nothing here shows they help; the person decides.
7. EACH provocation SHALL have "I did this and it did not work", which adds a try with a different approach, and "Not this one", which draws another.
8. THE worker SHALL accept requests only from the site's own origin, rate-limit by caller on its own key, run on the Free plan, and never log anything the model said.
9. A provocation SHALL NOT change any pit number.

## Not in scope
- No claim that a provocation works. No measure of how good they are: what is measured is the pass rate of the fixed rules, the time, and that the deck passes the rules.
