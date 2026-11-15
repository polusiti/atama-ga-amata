# Shop UI: requirements

Replace the setup wizard with a 1999-style shopping site shown inside a Windows 98 browser window.
Why: results should appear from the first answer and improve with each one (earlier value), and the shelf metaphor shows people what they could ask for.

Background: early Amazon used tabs, a left sidebar, a right sidebar and daily deals (Version Museum, LukeW). We borrow the era and the layout idea only. No logos, names or colors of any real company.

## Requirements (EARS)

1. WHEN the page loads, THE SYSTEM SHALL show a Windows 98 desktop with a browser window containing the store, a taskbar, and a language toggle.
2. WHEN the user answers a question, THE SYSTEM SHALL re-rank the shelf and update the belief panel in the same render, with no network call.
3. WHILE no question is answered and no solution is named, THE SYSTEM SHALL dim the shelf and tell the user to answer a question on the left.
4. WHEN the user selects an answered question in the history, THE SYSTEM SHALL discard that answer and every later one.
5. WHEN the stop rule fires, THE SYSTEM SHALL say why, stop asking, and keep the shelf usable.
6. WHEN the gap between the named solution and the inferred need is large, THE SYSTEM SHALL show a warning dialog that names the XY problem.
7. WHEN the user puts a solution in the cart, THE SYSTEM SHALL show its EARS spec and the persuasion audit in the cart tab.
8. THE SYSTEM SHALL mark each shelf item as "you named this" or "suggested", and show its cost.
9. THE SYSTEM SHALL feature the best-fitting solution the user did not name in a "Coffin Box" panel.
10. THE SYSTEM SHALL show the browser address as a function of the current state, with no real navigation.
11. WHERE the user prefers reduced motion, THE SYSTEM SHALL not blink or animate.
12. THE SYSTEM SHALL be usable by keyboard and available in Japanese and English.
13. THE SYSTEM SHALL not use any third-party logo or trademark.

## Out of scope
Multi-party mode, real data sources, accounts, saving sessions.
