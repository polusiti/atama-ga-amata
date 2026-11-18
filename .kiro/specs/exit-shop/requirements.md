# Exit shop: requirements

Idea (the user's): solve a problem like shopping. Choose this and this, with theory and data beside each option.

Principle (one sentence): show each exit as a product page with its theory, its evidence (or its absence), its cost, its prerequisites and when it does not fit; let the person put several in a cart; check the cart for prerequisites, order and evidence; say plainly when there is no data.

Checked against other fields: patient decision aids (treatment options with benefits and harms; a Cochrane review of 52 studies and 13,316 people found a knowledge gain of 13.27 points out of 100, high-quality evidence, and more accurate risk perception, moderate-quality evidence), buying a computer (spec sheet and a compatibility check), choosing university courses (prerequisite check).

Limits found before building: shopping is the form of the logic of choice, which Mol criticises, and decision aids support a choice, they do not replace accompaniment. The choice-overload effect has a mean of about zero across studies (Scheibehenne et al. 2010), so three options is a design choice, not a proven need. Only 8 of 17 developer moves name a source, and those sources are about the problem or the method, not about the move working in this use.

## Requirements (EARS)

1. EVERY move on the shelf SHALL have a spec sheet with: theory (why it should work, and the source), evidence, cost, prerequisites, and when it does not fit.
2. THE evidence field SHALL be one of three levels: `none` (no test of this move in this use), `problem-studied` (a study shows the problem the move addresses), `method-published` (a published method; not tested for this product). THE sheet SHALL say in words what the level means.
3. A move that does not name a source SHALL have level `none`, or no sheet. THE UI SHALL then say "no theory or data recorded". A sheet SHALL NOT invent a source.
4. A sourced move SHALL NEVER be described as shown to work. THE UI SHALL state that a source says where a method comes from, not that it works here.
5. THE person SHALL be able to put several moves into one cart and remove them.
6. WHEN the cart changes, THE shop SHALL check it: the order of the moves by prerequisites; prerequisites that are neither in the cart nor already in place; the number of steps in all; how many of the moves have each evidence level.
7. IF a prerequisite is missing, THEN THE shop SHALL name it and offer to add it. THE shop SHALL NOT block the person from keeping the cart as it is.
8. IF every move in the cart has evidence level `none`, THEN THE shop SHALL say so before anything else.
9. THE cart SHALL end with a way back: after trying, the person records the result as a new attempt, and the pit verdict is recomputed.
10. THE wording SHALL follow voice.md: the move is described, not the person; no blame; costs stated.

## Not in scope in this slice
- Conflicts between moves: no sourced conflict exists in the data, so none is invented.
- A total in minutes: costs are text, and no number of minutes has a source. The check counts steps instead.
- The attempt-entry screen of the pit verdict (separate slice).
