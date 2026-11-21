# Idea burst: requirements

Decision (2026-11-20, by the user): more than being correct, the model should put out ideas, because a spread of different ideas may be what gets a person out of the pit. The earlier "step explainer" design is replaced by this one.

Principle (one sentence): to a person who keeps repeating one approach, give several ideas of different kinds, each with a quick way to test it, and let the person find out which one is right by trying.
Checked against other fields: an editor who cannot get a chapter to work is better served by five different angles and a short trial draft of each than by one order to fix it; a person lost in a city is better served by several landmarks to try than by one confident wrong turn.

## Requirements (EARS)
1. WHEN the pit verdict is "switch", THE page SHALL offer "Get ideas": the person writes, in one or two sentences, what is stuck (at most 400 characters), and the page sends it to the worker.
2. THE worker SHALL ask a language model for exactly five ideas and return them only if they pass the fixed rules of requirement 3. Each idea has: `kind`, `title` (at most 60 characters), `how` (at most 220 characters) and `quickTest` (at most 160 characters: something the person can do in about ten minutes to find out whether the idea helps, and what result would speak for or against it).
3. THE fixed rules SHALL reject the whole answer if: there are not exactly five ideas; a field is missing, empty, too long or of the wrong type; a `kind` is neither the id of an exit move nor "other"; two ideas have the same `kind`, or more than one is "other"; fewer than three kinds are exit-move ids; two titles are the same; any text claims to have run, tested or checked code (English or Japanese); any text has a code block or a URL; or any text opens as an AI disclaimer. A rejected answer SHALL NOT be shown.
4. THE ideas SHALL be of different kinds, so that they are not five versions of one approach. The `kind` rule of requirement 3 is how this is enforced.
4a. THE ideas SHALL be written in the language the page asked for. A Japanese answer needs at least two kana or kanji in `how` and in `quickTest` of every idea; an English answer needs none. An answer in the wrong language SHALL be rejected.
4b. THE worker, and only the worker, MAY cut a text that is too long to its limit, at the end of a sentence, before the other rules are applied. The page SHALL NOT cut anything. The length of an idea says nothing about it, and a model writes more than it is asked to.
5. WHEN ideas are shown, EACH idea SHALL show its `quickTest` and a label for its kind: the move's title and "source: ..." for a move that names a source, "rule of thumb" for a move that does not, and "the model's own idea, no source" for "other". THE page SHALL say once that a language model wrote the ideas from what the person typed, that they are untested ideas and not facts, and that the quick test is how to find out.
6. THE model SHALL NOT be asked to be correct, to explain a step, to praise or to agree. THE system prompt SHALL tell it to avoid the approach the person has been repeating, to give ideas that differ from one another, and to keep each idea short and concrete.
7. EACH idea SHALL have a button "I tried this and it did not work". It adds a try with a different approach, like the same button on the exit moves. An idea whose kind is an exit move SHALL also have "Add to plan".
8. WHEN the answer is rejected, the model is down, the limit is reached or the request takes longer than 30 seconds (measured with the larger model: median 10 seconds in English and 17 in Japanese, and up to 21 seconds in Japanese), THE page SHALL say so in one line. The exit moves with sources stay on the screen, so nothing is lost.
9. THE worker SHALL accept requests only from the site's own origin, limit the text to 400 characters, rate-limit by caller on a limiter separate from the reader's, run on the Free plan, and never log the typed text or the ideas.
10. THE typed text SHALL be passed to the model as a quoted data value, apart from the instructions. THE ideas SHALL NOT change any pit number or the order of the exit moves.
11. THE page SHALL tell the person that the sentence they type is sent to the worker and nothing is stored.

## Not in scope
- No claim that an idea is correct or that it works. No free chat. No memory across visits. No code writing.
- No measure of how good the ideas are. What is measured is the pass rate of the fixed rules and the spread of kinds.
