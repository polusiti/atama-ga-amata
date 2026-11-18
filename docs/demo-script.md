# Demo script (target: under 3 minutes)

Status: written, not yet rehearsed or timed. The times below are a plan. The numbers on screen are the ones the app computed on 2026-11-18 (checked in the browser run and in `scripts/pit-case.ts`).

Set up before recording: open the site in English (the EN button), on the first tab ("THE PIT"), with no tries added. Have the Kiro IDE open on this repo, with the MCP server started.

## 0:00 - 0:25 The problem, in one real case
Say: "On the day I built this, my own coding agent sent the same kind of long command again and again. Each one was interrupted. It read each failure as bad luck and tried the same thing again. That is an antlion pit: every struggle makes the slope slide. This is the first user of the product."
Show: `docs/incidents.md`, INC-17, for two seconds. Do not read it out.

## 0:25 - 1:15 The pit screen
Show the first tab. Press "Add a try that did not work" once.
Say: "After one failure: 24% for another try of the same approach, 20% for a fresh one. Keep going."
Press it a second time.
Say: "After two: 17% against 20%. The wording now says this approach seems to be failing. It says the approach, not the person."
Point at the small line under the numbers.
Say: "Both numbers are set by hand. The site says so, and it does not give a rule like 'switch after three tries'. With other hand-set values the turning point moves between zero and seven failures."
Tick "A different approach from the one before" on the second try.
Say: "A different approach resets the count. Time already spent does not enter the calculation."
Untick it again.

## 1:15 - 1:55 Exit moves, with sources and costs
Scroll to the exit moves.
Say: "At most three moves, and only moves that name a source. Each has a cost. The line under each one says a source tells you where the method comes from, not that it works for you."
Open one spec sheet from the SHOP tab (theory, data level, when it may not fit).
Say: "Where the shop has no data, it says so: 'no theory or data is recorded'."

## 1:55 - 2:20 Plan, and coming back
Press "Add to plan" on two moves. Open the CART tab.
Say: "It orders the moves by prerequisites, counts the steps, and says how many of the chosen moves have any recorded data. When none does, it says so first."
Go back to THE PIT, press "I tried it and it did not work".
Say: "Trying a move comes back as a new attempt, and the chances are recomputed."

## 2:20 - 2:50 How Kiro is used
Show, one second each: `.kiro/specs/pit-escape/`, `.kiro/steering/pit-guard.md`, the hooks folder.
In the IDE chat, ask the agent to run `pit_check` with two failed same-approach tries.
Say: "The same check is an MCP tool. A steering file tells the agent to call it after two failed tries of the same approach, so the agent that built this checks itself. The specs came before the code, and the incident file produced the rules the agent follows."
Only show the tool call if it has been run in the IDE since the MCP restart. If not, cut this and say the tool exists and is tested.

## 2:50 - 3:00 Honest limits
Say: "No real user has tried it yet. The numbers are hand-set, and no move is claimed to work for you. It shows its sources and says what it does not know."

## Cut order if the video runs long
1. The spec-sheet close-up.
2. The plan screen.
3. The Kiro files montage (keep the `pit_check` call).
