# Lessons from failures: requirements

Source of the idea (read, not copied): InteractionKit turns its "how to extend" procedure into a hook. rumornet writes steering from the agent's own bad habits (fake tests, specification gaming). Google's SRE book keeps blameless postmortems in a shared repository. Matthew Syed's argument, as far as the reviews I read go, is that learning needs failures to be recorded.

## Requirements (EARS)

1. THE repository SHALL keep a record of incidents from this project in `docs/incidents.md`, one entry per incident, in a blameless form: what happened, which conditions allowed it, how it was noticed, what changed.
2. EVERY incident SHALL carry a source label: `own` (happened in this project and is in the journal or the conversation), or `third party` with a link. THE record SHALL NOT contain invented incidents.
3. THE steering file `agent-conduct.md` SHALL state rules for the agent, each pointing to the incident that caused it. THE file SHALL be included in every session.
4. WHEN a pack file in `src/data/` is saved, THE hook SHALL run the coverage report and show its output.
5. THE coverage report SHALL list, for every need: discriminating probes, moves that fit it, moves with a named source, lexicon words, sample sentences.
6. IF a need has no discriminating probe, no fitting move, no lexicon word or no sample sentence, THEN THE report SHALL list it as a gap and exit with a non-zero code.
7. THE report SHALL NOT invent or fill in any number. Authored numbers stay a human decision (see `evidence.md`).
8. THE coverage function SHALL be pure and have property tests.

## Not in scope
- No casebook screen yet. The incident record is the first source for it.
- No claim that the incidents are representative. They are five or six of one project.
