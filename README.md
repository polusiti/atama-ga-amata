# atamagazon (atama-ga-amata)

Kiroween 2026, Frankenstein category (solo, student).

**atamagazon** is a pun on the repository name atama-ga-amata ("many heads"). It is a department store for troubles, styled after online storefronts around 2000, shown inside a Windows 98 browser window.`n`n**The XY problem, solved mechanically.** People ask for a solution (Y) when what hurts is a situation (X). Tell the shopkeeper of the midnight department store what you already have in mind, answer a few questions about real past episodes, and see how far your idea sits from the need your answers point to. Then pick from shelves that include things you did not ask for, and get an EARS-style spec.

No LLM runs at runtime. The engine is a small, deterministic, tested core:

- Belief over underlying needs, updated by Bayes with an explicit answer model (5 graded answers, a fixed "don't know" share, Gaussian noise).
- Next question chosen by exact expected information gain (mutual information) per unit of user effort. Stops when another question is worth less than it costs.
- A stated solution is noisy evidence about the need, not the need itself.
- The gap between your stated solution and the inferred need is the Fisher-Rao distance, `2 * arccos(sum sqrt(p_i q_i))`.
- Persuasion audit: shows what you named first, what the shop suggested and what you chose.

See `.kiro/steering/charter.md` for the principles and `docs/assumptions.md` for what is authored judgment rather than measured data.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # property-based tests (fast-check) and KB integrity
npm run build
```

Deploys to Vercel as a static Next.js app. No environment variables, no database.

## Layout

- `src/core/` pure math and engine (no I/O)
- `src/data/kb.ts` the shelf: needs, questions, solutions (Japanese and English)
- `src/app/` UI
- `.kiro/` steering and specs used to build this with Kiro
- `docs/journal.md` development journal

## License

MIT

