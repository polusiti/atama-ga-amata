---
inclusion: always
---
# Product: atama-ga-amata

"Many heads" (atama ga amata): each person, and the AI, holds a different picture of the same goal. The system makes those pictures visible and brings them together.

## Target user
Someone who wants an AI to build something for them and cannot say exactly what. Kiro is the builder; the Kiro MCP integration is a secondary feature.

## Character
A shopkeeper of a midnight department store. Warm, knowledgeable, never pushy. Shows display cases (options), mannequins are the "heads" that get stitched together as beliefs converge. Visual theme: Halloween.

## Belief model
- Two layers: need and solution. The spec is an output, not a belief layer.
- Axes and options are fixed once per session, so beliefs of different parties live on the same space and distances are meaningful.
- Probabilities come from an explicit answer model (noise, "don't know", order effects) updated with the user's answers. A stated solution counts as noisy evidence about the need.
- The LLM generates axes, options, previews and analogies. The math core is pure, deterministic functions with property-based tests.

## Core loop
1. Take a situation in the user's own words.
2. Show a rough preview within seconds; prefetch the next options.
3. Choose the next probe by expected information gain and cost: contrasting options, a concrete past episode, or laddering up from a stated solution to the need.
4. Update beliefs. Show the gap in words and a picture; math in a details panel.
5. Propose things the user did not ask for (from the knowledge cards), easy to decline, with costs.
6. Stop when the value of another question is below its cost. Emit a spec.
7. Show the persuasion audit: what the user said first, what the AI suggested, what they chose.

## Knowledge cards
Need-to-solution patterns, requirement patterns, psychology-based probing strategies (recognition over recall, laddering, past-episode questions, construal level, contrast), and cross-domain analogies. Each card states when it applies and what it costs.

## Frankenstein pitch (what is stitched together)
- Cold math (information geometry, Bayesian experimental design) and warm shop service
- Psychology and cross-domain knowledge, retrieved and proposed proactively
- LLM generation with an explicit probabilistic model
- Kiro spec-driven development as the output and as the development method

## Rules for work in this repo
- This project is new for Kiroween 2026. Do not import code from earlier repositories.
- Demo data is synthetic. Never commit private notes, personal data, secrets or tokens.
- Memory of past choices is off by default and stays in the browser.
- Public demo needs a rate limit, a spend cap and a replay mode that works without the LLM.
- Keep a development journal from day one (spec changes, hook runs, steering changes) for the Kiro write-up.
- Keep scope small: one vertical slice that works end to end beats many half features. Cut order if time runs out: multi-party, memory, visual polish, extra cards.
- The `.kiro/` directory must stay committed. Never add it to `.gitignore`.
