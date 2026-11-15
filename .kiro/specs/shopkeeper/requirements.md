# Shopkeeper (assistant): requirements

A rule-based assistant in the style of ELIZA (1966) with the conventions of 2016-era voice assistants (confirm before acting, say what you can help with when you did not understand). No LLM, no network.

## Prior art and what we borrow (ideas, not code)

- ELIZA (Weizenbaum, 1966). Original source released CC0 (ELIZAGEN). Borrowed ideas: keywords with a rank, decomposition and reassembly, a fallback when no keyword matches, a memory of an earlier statement.
- Existing JavaScript ELIZA ports found on GitHub are English regex lists or have no license. None is reused.
- Frame-based dialogue (GUS, Bobrow et al., 1977) and SiriKit's resolve, confirm, handle flow: confirm before acting; ask when a slot is missing.
- Motivational interviewing skills (OARS, Miller and Rollnick): open questions, reflections, summaries. We borrow the phrasing style only. No claim of effect.

## Requirements (EARS)

1. WHEN the page loads, THE SYSTEM SHALL show the shopkeeper window with a greeting.
2. WHEN the user submits text, THE SYSTEM SHALL normalize it (Unicode NFKC, case, katakana to hiragana, whitespace and punctuation removed) and match it against a lexicon of troubles.
3. WHEN the text matches a trouble, THE SYSTEM SHALL turn the match into weak, bounded evidence about the need, and reflect it back in a hedged sentence.
4. WHEN the text names a known solution and none is set, THE SYSTEM SHALL record it as the named solution and ask what would get easier if it worked (laddering).
5. WHEN the text matches nothing, THE SYSTEM SHALL say it could not follow and offer sample troubles the user can click.
6. WHEN the stop rule fires, THE SYSTEM SHALL summarize, recalling the user's first statement (memory).
7. WHEN the user adds a solution to the cart whose expected fit is below 0.5, THE SYSTEM SHALL ask for confirmation first.
8. THE SYSTEM SHALL choose between templates deterministically from the turn number so the same session gives the same replies and consecutive replies differ.
9. THE SYSTEM SHALL never claim to understand. Wording is hedged. The About page states that it is a rule-based program (ELIZA effect).
10. WHERE a local (not remote) Japanese or English speech synthesis voice exists, THE SYSTEM SHALL offer an opt-in toggle to speak replies, off by default. Otherwise no toggle.
11. THE SYSTEM SHALL keep all text in the browser. No network call.

## Out of scope
Voice input, learning from conversations, multi-party mode.
