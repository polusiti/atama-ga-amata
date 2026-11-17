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