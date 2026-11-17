---
inclusion: fileMatch
fileMatchPattern: "src/data/**/*.ts"
---

# Evidence: what a knowledge-base entry must carry

- Every next move (solution) has `source`: a paper, a book, or the exact string "rule of thumb, not tested" (in both languages). Do not invent citations. Read the source before citing it.
- Numbers in `fit`, `yes` and `base` are authored by hand. They are not measured. Do not describe them as probabilities from data. The "where the math stops" panel counts them from the data, so adding entries changes that count.
- `requires` must stay acyclic. `practice` on a probe must name an existing move.
- A need with `side: "self"` must have at least one probe the person can check alone and one move that is a self-test.
- After changing numbers in a pack, re-run `npm run bench` and update `docs/benchmark.md`. Do not hide a worse result.
