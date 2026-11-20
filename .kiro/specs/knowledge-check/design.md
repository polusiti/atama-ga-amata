# Knowledge check: design

## Parts
- `src/data/knowledge-items.ts`: the item bank. Each item has `id`, `topic`, `level` (1 to 3, by hand), `stem`, five `statements`, the index of the `wrong` one, `why`, and `source` (`url` and `checked`, or `premise`). Everything is in both languages.
- `src/core/knowledge.ts` (pure): `nextItem(items, topics, answers)` follows requirement 3. `report(items, topics, answers)` returns one status per area and the "read first" links. `isCorrect(item, choice)`.
- `src/app/Shop.tsx`: a tab "CHECK" in pit-focus mode. One question at a time, the five statements and "I don't know" as buttons, then the explanation and a Next button. At the end, the report. The pit screen shows the "read first" list when a report exists.

## Item sources (read 2026-11-20)
- Docker: the "What is an image" and "What is a container" pages and the Volumes page of docs.docker.com.
- MCP: the Architecture overview of modelcontextprotocol.io.
- Git: "What is Git?" in the Pro Git book (git-scm.com).
- HTTP: MDN's reference pages for methods and status codes.
- AI replies: the questions state their own premise (the log, or the fact that the AI has no way to run code), and one question rests on Sharma et al. 2023 (arXiv:2310.13548).
The documentation of fast-moving tools can go stale (two Workers AI models named in the docs were already withdrawn when this was built). The questions therefore use concepts that change slowly, and each carries its checked date.

## Choices
- Five areas, three questions each, so that the second question can move up or down a level. Fifteen questions in all; a person sees at most ten.
- A miss is not shown as a score. The status words are "looks in place", "partly in place" and "worth reading first", and the last two come with links to the source of the missed question.
- The correct statement positions are mixed by hand across the questions. A test requires that the wrong statement is not always in the same place.
- The levels are the author's judgment. They are not measured from answers, and the screen says so.
