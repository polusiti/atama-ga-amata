# Knowledge check: requirements

Decision (2026-11-20, by the user): before advising, measure what the person actually knows, with questions that have an answer, in the form "choose the wrong statement". The areas include how Docker and MCP work, and whether the person can tell when an AI's answer is wrong. The same idea as the author's reading-practice site (multiple choice with an explanation after each question; only the shape is taken, nothing is copied).

Principle (one sentence): measure with questions that have an answer, not with self-report, and use a miss only as a reason to point at what to read first, never as a label on the person.
Checked against other fields: a pharmacist who asks about drug interactions before explaining a prescription; a driving instructor who asks the learner to spot the error in a scene before the next lesson. Both hold.

## Requirements (EARS)
1. THE check SHALL ask one question at a time. Each question has five statements, exactly one of them wrong, and a sixth choice "I don't know".
2. THE check SHALL cover five areas: Docker, MCP, Git, HTTP, and spotting mistakes in an AI's reply. Each area has three questions at levels 1, 2 and 3. The levels are set by hand and the screen SHALL say so.
3. THE check SHALL ask at most two questions per area. The first is at level 2. If it is answered right, the second is at level 3. If it is answered wrong or with "I don't know", the second is at level 1.
4. AFTER each answer, THE check SHALL show which statement was wrong, why, and the source, whether the answer was right or not. THE wording SHALL NOT blame the person.
5. EVERY question SHALL carry a source: a URL of the documentation or paper it rests on and the date it was checked, or the premise stated in the question itself. A question without one SHALL fail the data test.
6. AT the end, THE check SHALL show, per area, one of "looks in place", "partly in place" or "worth reading first", with links for the second and third. It SHALL NOT show a score, a rank, a percentage or a label on the person.
7. THE areas that are partly in place or worth reading first SHALL also appear as a short "read first" list on the pit screen, under the exit moves. The numbers and the ranking of exit moves SHALL NOT change because of the check.
8. THE check SHALL be skippable at any point, and the rest of the site SHALL work without it. Nothing SHALL be stored or sent.
9. THE selection and the report SHALL be pure functions with tests: no question twice, at most two per area, and the level rule of requirement 3.

## Not in scope
- No claim that the levels are calibrated. There is no data from real people.
- No grading of free text. No language model in this check.
- No link from a missed question to a hand-set number in the pit verdict.
