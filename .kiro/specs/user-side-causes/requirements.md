# User-side causes: requirements

Observation from the tester: when the cause of being stuck is on the user's side, an AI rarely says so. This is consistent with what we read: AI assistants tend to match the user's views (Sharma et al. 2023, arXiv:2310.13548). "The cause may be you" is the least welcome thing to say.

Principle: do not accuse and do not flatter. Give the person a small test they run themselves, so the gap shows up in their own hands. A rule-based engine has no incentive to please, but it still relies on self-report, so every user-side probe is phrased as a concrete act or fact, and every move is an act the user can do and see.

The same mechanism applies to other fields (learning, shopping, personal life, design, work). Only the knowledge pack changes. New packs are not part of this task: each needs its own sources.

## Requirements (EARS)

1. THE developer-stuck pack SHALL include four stall types whose cause is in the person's own understanding, assumptions, target or state: a gap in understanding of the failing part, an unchecked assumption, an unclear target, and wear (long time on task, attachment to one hypothesis).
2. Each such stall type SHALL have at least one probe phrased as a concrete act or fact, one signal probe, and one move that is a self-test.
3. Each such move SHALL say what to do, what result means a gap, and what to do next, and SHALL state its source or "rule of thumb, not tested".
4. THE SYSTEM SHALL mark such stall types as "self-checkable" and, when one leads, say in one line that this kind of stall can be checked by your own hands.
5. THE SYSTEM SHALL NOT say or imply that the user is at fault. The wording SHALL describe the stall and the test, not the person.
6. THE SYSTEM SHALL keep working for the existing stall types and the everyday pack.

## Out of scope
New packs for other fields. Verifying the user's answers. Medical or psychological claims about fatigue.
