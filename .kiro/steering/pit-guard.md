---
inclusion: always
---

# Pit guard: do not dig deeper

An antlion pit is a trap where each struggle makes the slope slide. In a back-and-forth with a person, it is repeating the same approach, failing, and trying it again.

## When to call `pit_check`
After two failed tries of the same approach, and before a third, call `pit_check` (MCP server `atamagazon`) with the recent tries, oldest first.
- `newApproach`: true if the try used a different approach from the one before (a different cause, a different tool, a smaller problem, a fresh start). A tweak of the same fix is false.
- `newFact`: true if the try produced a fact that was not known before (a log line, a measured value, a reproduced failure).
Set these from what you observed. If you cannot tell, ask the person. Do not guess to reach a verdict.

"Two" is the point at which to look, not a conclusion. The conclusion is the tool's two numbers.

## What to do with the result
- `persist`: continue, and record each try.
- `switch`: do not make the same try again. Tell the person plainly, in one or two sentences: the approach is failing, the chance that another try of it works (`chanceNextTryOfSameApproachWorks`) against a fresh approach (`chanceFreshApproachWorks`), and that both numbers are set by hand. Offer the exit moves with their cost and source. The person chooses.
- If `noSourcedMoveFits` is set, say that no sourced move fits. You may mention the rule-of-thumb moves, labelled as such.

## What not to do
- Do not say how many tries are "allowed". The tool shows that the count depends on numbers set by hand.
- Do not blame the person. The approach is failing; the person is not.
- Do not call a move tested because it is sourced. A source says where the method comes from, not that it works here.
- Do not skip the call because the next try "looks different". If it is a new approach, the tool will say so by `newApproach: true`.

Source of the rule: INC-17 in `docs/incidents.md` (the agent that built this product repeated the same shape of command four times).
