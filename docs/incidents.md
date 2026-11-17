# Incidents

Written without blame, after the blameless postmortem practice described in Google's SRE book (https://sre.google/sre-book/postmortem-culture/). Each entry says what happened, what in the setup allowed it, how it was noticed and what changed. The "actor" is the AI agent working in this repository unless stated.

Source labels: `own` means it happened in this project and is in `docs/journal.md` or in the working conversation. `third party` means a published account, linked. Nothing here is invented. Nine incidents from one project say little about how common each kind is.

## INC-01 Processes stopped without checking the owner (own)
- **Happened:** While cleaning up leftover test servers, six `node` processes were stopped. They belonged to another application.
- **Conditions:** The cleanup matched processes by name. Test servers and other programs share that name. No step checked who started a process.
- **Noticed:** After the fact, while reviewing what had been stopped. Reported to the user.
- **Changed:** Stop only processes started in the same session, identified by the exact command line. Now a rule in `agent-conduct.md`.

## INC-02 Two writers on one file (own)
- **Happened:** A file was edited with the edit tool and with a PowerShell script at the same moment. The script's write replaced the edit tool's change, and a whole section was missing.
- **Conditions:** Two tools wrote to one path with no ordering.
- **Noticed:** A browser check on the page.
- **Changed:** One writer per file at a time. In a later session two edit calls to the same file were again sent in parallel; both landed and a search confirmed it, so the rule was kept as it was and the near miss is recorded here.

## INC-03 The design followed a stated liking, not the stated problem (own)
- **Happened:** Twice the design moved toward mathematics (a math shelf, a quantum-mechanics diagnostic) while the stated problem was engineers who hit a wall in repeated conversations with an AI.
- **Conditions:** The user had said they like mathematics. That liking was treated as the goal. This is the agreement-with-the-user pattern the project is about.
- **Noticed:** By the user, both times.
- **Changed:** The problem is restated in the user's words before a design change. This is a practice, not an enforced check.

## INC-04 Checks passed while a bug was present (own)
- **Happened:** The app stopped after two answers with "no more value in asking". The minimum-answers rule covered only one of the stop reasons.
- **Conditions:** The browser checks followed one path and did not assert how many questions were asked.
- **Noticed:** By looking at a screenshot.
- **Changed:** The rule now covers every stop reason, with a test.

## INC-05 Always agreeing looked like certainty (own)
- **Happened:** A user who answered "yes" to everything made the engine 100% confident after two answers.
- **Conditions:** The answer model had no lapse rate, so one answer could carry unbounded evidence. There was no minimum number of answers.
- **Noticed:** By a benchmark written after the user raised the echo-chamber concern.
- **Changed:** A lapse rate of 0.1 and a minimum of four answers. **Still open:** random and off-shelf users stop "confident" about 45% of the time at chance accuracy. A "none of these" hypothesis is not built yet.

## INC-06 Typed numbers that no longer matched the data (own)
- **Happened:** The home page said "8 kinds of stall and 12 next moves". The pack had 12 and 17.
- **Conditions:** The counts were typed into the text when the pack was smaller. Nothing linked the text to the data.
- **Noticed:** By looking at a screenshot.
- **Changed:** The counts are read from the pack. Other typed numbers may remain.
- **Recurrence:** While preparing the project report, two documents were found with typed numbers that no longer matched: `docs/benchmark.md` (a sentence said 60.5% where the table said 62.7%, and "four in ten" where the table said 45%) and `docs/assumptions.md` item 20 (eight stalls, 17 probes, 12 moves; the pack has 12, 27 and 17). Both were corrected. The documents are not generated from data, so this can happen again.

## INC-07 A scripted edit did not apply, and the checks still passed (own)
- **Happened:** A multi-step PowerShell edit of one file changed a copy of the text inside a helper function. No error was shown. Typecheck and tests passed because the file had not changed.
- **Conditions:** The helper's variable scope hid the failure. Passing checks on an unchanged file say nothing about the intended change.
- **Noticed:** `git status` listed only one of the two files that should have changed.
- **Changed:** Confirm that an edit landed (`git status`, `git diff --stat`) before running checks. Edits are made one call at a time.

## INC-08 A property test that failed only on some runs (own)
- **Happened:** The "path is never shorter than the straight line" property failed on a later run with two "unknown" answers. Path length was 0 and the straight distance 2.9e-8.
- **Conditions:** `acos(1 - e)` is about `sqrt(2e)`, so rounding of 1e-16 appears as about 1e-8 near equal beliefs. The tolerance was 1e-9.
- **Noticed:** By the `verify-on-stop` hook after the end of a turn.
- **Changed:** Tolerance 1e-6, with a comment that gives the reason. The property itself was not weakened.

## INC-09 A fact stated before it was checked (own)
- **Happened:** The repository's license was reported as "none".
- **Conditions:** The field queried does not report the license in the way assumed. The result was not cross-checked.
- **Noticed:** On looking again at the source.
- **Changed:** A claim that can be checked at its source is checked there, or marked "unverified".

## INC-10 Absorbed in a sub-problem (third party)
- **Happened:** United Airlines Flight 173 (1978) circled while the crew diagnosed a landing-gear indicator. The fuel ran out and 10 people died. The NTSB recommended crew resource management training.
- **Conditions (from the report as summarized):** Attention went almost entirely to the gear problem. The other crew members did not get the fuel concern across.
- **Source:** https://en.wikipedia.org/wiki/United_Airlines_Flight_173 (the NTSB report itself was not opened).
- **Relevance (this project's reading, not the report's):** The same shape as a back-and-forth with an AI that keeps working on one fix.

## INC-11 A rule was written for every pack but tested for one (own)
- **Happened:** `evidence.md` asks every move in every pack for a source or the rule-of-thumb label. The `everyday` pack had no source field on any of its 10 moves. All tests passed.
- **Conditions:** The test for this rule loops over the `devstuck` pack only. The `everyday` pack predates the rule.
- **Noticed:** By the new coverage and source census scripts, written to look at the packs from the outside.
- **Changed:** The check now covers every pack. The `everyday` moves carry the rule-of-thumb label, since no source was read for them. No citation was added.

## INC-12 A scripted edit corrupted a file, and an old result was read as new (own)
- **Happened:** A PowerShell script inserted a Japanese string into `src/data/kb.ts`. The string was garbled and the closing quote was lost, so six test files could not load. A first check run was interrupted. Its absence of output was not reported as a failure at first. Later a results file that is appended to, not overwritten, still showed the first failing run, and it was read as the current result.
- **Conditions:** Windows PowerShell 5.1 reads a script file without a byte-order mark as the local code page. `git diff --stat` showed 13 inserted lines, which matched the plan, so the stat gave no sign of the damage. The results file was appended to.
- **Noticed:** The typecheck and the test run failed. The file's start time and the output's timestamps did not match, which showed that old output was being read.
- **Changed:** Text with non-ASCII characters is written with the edit tool, not with a script. After a scripted edit the changed lines are read back, not only counted. Check output goes to a new file for every run, and its timestamp is compared with the time of the run.
## INC-13 A hook did not load because its trigger name was guessed (own)
- **Happened:** The `journal-reminder` hook used the trigger `PostTaskExecution`. The IDE log said, three times, that this name is not recognized, so the hook was never registered. The journal and the README listed it as working.
- **Conditions:** The documentation page shows the display name "Post Task Execution". The file needs the internal name `PostTaskExec`. The name was derived by joining the display name, not read from a source. The IDE also tells agents to create hooks with its `createHook` tool and not by writing the files by hand. Hand-written files that follow the schema load, but a mistake in a name is only reported in a log.
- **Noticed:** While checking the IDE log for hook loading, on request. No error was visible in the editor.
- **Changed:** The trigger name is taken from the IDE's own list: SessionStart, SessionEnd, Stop, SubagentStop, PreToolUse, PermissionRequest, PostToolUse, PreTaskExec, PostTaskExec, PreCompact, PostCompact, UserPromptSubmit, PostFileCreate, PostFileSave, PostFileDelete, Manual. After writing a hook, the log is read for "not a recognized name" or "failed schema validation".
## INC-14 Agent files used a field that is not in the agent schema (own)
- **Happened:** Both custom agents (`stall-doctor`, `kb-reviewer`) set `allowedTools`. The IDE's schema for agent files has no such field. `stall-doctor` also lacked `includeMcpJson`, which the schema offers for access to MCP tools. The README and the journal described both agents as working. No error was visible.
- **Conditions:** The field names were written from memory of the CLI documentation. The agent file was never validated against a schema. A first look at the IDE source found `allowedTools` in an internal function and was read as a file field; a second look at the schema showed it is not one.
- **Noticed:** By reading the schema in the IDE extension, on request to check the integration. This was the second finding of that check (INC-13 was the first).
- **Changed:** Agent files use only fields from the schema: name, description, prompt, tools, excludedTools, model, effortLevel, includeMcpJson, includePowers, mcpServers, resources, permissions, welcomeMessage, dispatchKind, hooks. A check script validates the files against this list.
## INC-15 Conclusions drawn from the log of a window that had already closed (own)
- **Happened:** Over an hour of checking the IDE integration used `Kiro Logs.log` from the earliest log directory of the day. That file stopped at 19:05. The current window writes to a newer directory. From the old file it was concluded that no warning had appeared after the hook fix, and that there was no sign of the MCP server. Both conclusions were drawn from a file that could not contain the answer.
- **Conditions:** The log directories are named by start time, and several exist per day. The newest file by name looked like the live one. The file's last-write time (19:05, an hour old) was visible and was not compared with the time of the events being looked for.
- **Noticed:** After a probe hook was fired and its start did not appear in the log. The probe's file proved that the hook ran, so the log could not be the live one.
- **Changed:** Before reading a log, compare its last-write time with the present time. A result of "no line found" is only evidence if the log was being written at the time in question.
- **What the live log showed:** four of five hooks registered at 19:06 (`journal-reminder` was excluded for its trigger name); a probe hook fired at 20:28 and the IDE logged it; both agent profiles loaded after the fix; **the IDE's MCP subsystem is disabled**, so the `atamagazon` server is not started by the IDE. Enabling it is a setting for the user.