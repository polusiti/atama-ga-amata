# Level opening: requirements

Decision (2026-11-20, by the user): the shopkeeper opens by asking how much the person reads and fixes the AI's code themselves, in a direct tone, and the flow follows the answer. Wording A was chosen: "Hey. First question. How much of the code an AI gives you do you read and fix yourself?"

Principle (one sentence): before advising, ask what the person actually does, with choices that describe behaviour and carry no label, and let the answer decide the next step.
Checked against other fields: a ski instructor who asks "have you skied before?" before choosing the slope; a doctor who takes a history before prescribing. Both hold.

## Requirements (EARS)
1. WHEN the pit screen opens, THE shopkeeper SHALL open with the level question and show four choices as buttons. The choices describe what the person does. They SHALL NOT be names such as "beginner" or "vibe coder".
2. WHEN the person picks a choice, THE shopkeeper SHALL repeat it back ("So ... right?") and then continue. It SHALL NOT claim to understand.
3. IF the person picks one of the first two choices (reads little, or asks the AI again when it fails), THEN THE shopkeeper SHALL offer the knowledge check (Yes / No), and say that repeating the same question to the AI may be where the loop starts, in hedged wording.
4. IF the person picks one of the last two choices, THEN THE shopkeeper SHALL ask for something they tried, in one sentence, with the examples shown as buttons.
5. THE choice SHALL NOT change any number or the order of exit moves. It only decides what the shopkeeper says next. (There is no sourced mapping from this answer to a number.)
6. THE wording SHALL NOT blame the person, in both languages, and the choices SHALL stay in the person's own words.
7. THE level question SHALL work without any network call, and it SHALL NOT be stored or sent anywhere.

## Not in scope
- No use of the answer to rank exit moves or to set the pit numbers.
- No score and no label on the person.
