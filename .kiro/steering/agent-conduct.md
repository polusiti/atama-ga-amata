---
inclusion: always
---

# Agent conduct

Each rule comes from an incident in `docs/incidents.md`. Keep this list short. Add a rule only after an incident, and write the incident first.

1. Stop only processes you started in this session, identified by the exact command line. Never match by name alone. (INC-01)
2. One writer per file at a time. Do not send parallel edits to the same path. (INC-02)
3. Before changing the design, restate the user's problem in their words. If you are following a stated liking and not the stated problem, say so. (INC-03)
4. A passing check proves only what it asserts. Look at the output or a screenshot for anything it does not assert. (INC-04)
5. Numbers and counts shown to the user come from data. Do not type them into text. (INC-06)
6. After an edit, confirm it landed (`git status`, `git diff --stat`) before running checks. (INC-07)
7. When a property test fails, decide whether the code or the test is wrong, and write the reason next to the fix. Do not weaken a property to make it pass. (INC-08)
8. State a fact only after checking it at its source, or label it "unverified". Say what was not verified when reporting that something is done. (INC-09)
9. Report negative results as they are. (INC-05)
10. Write text with non-ASCII characters with the edit tool, not with a script. After a scripted edit, read the changed lines back. Send each check's output to a new file and compare its timestamp with the time of the run. An interrupted run is a failed run. (INC-12)
11. A rule needs a check that covers every place it applies, not one example. (INC-11)
12. Before reading a log or an output file, compare its last-write time with the present time. "No line found" counts as evidence only if the file was being written at the time in question. (INC-15)
13. After writing a Kiro configuration file, run `npm run check:kiro` and read the live IDE log for "not a recognized name" or "failed schema validation". Do not describe a hook, agent or MCP server as working until the log or an observed effect shows it. (INC-13, INC-14)
14. When the user gives an example, first write the principle behind it in one sentence. Then check that the design also holds for a different example from another field. Do not design around the example. (INC-16, INC-03)
