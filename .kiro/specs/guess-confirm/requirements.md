# Guess and confirm: requirements

Why: the engine has no way to learn whether its diagnosis was right. Akinator closes this loop: it makes a guess, the player says right or wrong, and wrong guesses lead to more questions or to a correction. This spec adds the same loop, so the engine's accuracy can be measured on real people.

Ideas borrowed (not code): a final guess with a verdict; a rejected guess lowers that candidate but never removes it (a smoothing floor); a correction is staged, not applied at once (Aaklon/akinator, AGPL-3.0, read for ideas only).

## Requirements (EARS)

1. WHEN the stop rule fires, THE shop SHALL show the most likely need as a guess and ask whether it matches, with three answers: matches, not quite, can't tell.
2. WHEN the person answers "not quite", THE engine SHALL multiply that need's probability by a fixed factor (0.05) and renormalize, SHALL NOT set it to zero, and SHALL continue to question or make a second guess.
3. WHEN two guesses were rejected, THE shop SHALL ask which need is closest, offering every need and "none of these".
4. THE guess SHALL never be a need that was rejected in this round.
5. WHEN a round ends, THE shop SHALL record: pack id, number of answers, each guess with its probability, the verdict, and the chosen need. THE record SHALL contain no free text.
6. THE shop SHALL show the tally of rounds in this visit with a Wilson 95% interval and SHALL say that few rounds prove little.
7. THE shop SHALL show the mean stated probability of first guesses next to the share that matched.
8. WHEN the person asks to copy results, THE shop SHALL put the records as JSON on the clipboard. Nothing is sent anywhere, and nothing is stored after the tab closes.
9. WHEN an answer is undone or the shop is reset, THE guess state SHALL be cleared.
10. THE wording SHALL follow voice.md: hedged, no blame, no claim of understanding.

## Not in scope
- No automatic change to the authored numbers from records. A handful of corrections cannot tune the model. Records are for measuring, and for a human to review.
- No server, no account, no storage across visits (memory is off by default).
