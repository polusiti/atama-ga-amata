# Exit shop: design

## Data
- `src/core/types.ts`: new `SpecSheet { theory: L10n; evidence: { level: "none" | "problem-studied" | "method-published"; note: L10n }; unfitWhen: L10n }`.
- `src/data/devstuck-sheets.ts`: `Record<moveId, SpecSheet>` for the eight moves that name a source. Other moves have no sheet.
- `Pack` gets an optional `sheets`.
- Guard test: a sheet may exist only for a move that names a source (`isSourced`), a level other than `none` needs a named source, every sheet id exists in the pack, and every text exists in both languages.

## Cart check (`src/core/cart.ts`, pure)
`checkCart(kb, cartIds, establishedIds, sheets)` returns:
- `order`: the cart moves ordered so that a move comes after its prerequisites that are also in the cart. Stable for ties (cart order). `requires` is acyclic (tested), so a plain depth-first order is enough.
- `missing`: for each cart move, the prerequisites that are neither in the cart nor established. Transitive: the prerequisites of a missing prerequisite are listed too.
- `suggestAdd`: the missing prerequisites, once each, in an order that satisfies their own prerequisites.
- `steps`: sum of the number of steps (`requirements.length`) of the cart moves.
- `evidence`: count of cart moves per level; a move without a sheet counts as `none`.
- `allNoData`: true when the cart is not empty and every move counts as `none`.
Properties (fast-check): the order has no duplicates and respects prerequisites; adding `suggestAdd` to the cart makes `missing` empty; established moves never appear in `missing`; the result does not depend on the order of the cart for `missing` and `evidence`; an empty cart gives empty results and `allNoData` false.

## UI
- Shelf item: a details block "Spec sheet" with theory, evidence (level in words), cost, prerequisites, when not to use. A move without a sheet shows "No theory or data recorded".
- Cart: several items; each can be removed. Under the list: the order, the missing prerequisites with an "add" button, the step count, the evidence counts, and a line when all are `none`.
- The closing line asks the person to come back with the result.
- The existing single-item cart state becomes a list. The existing confirmations (blocked move, low fit) stay.

## Honest limits
- Theory text is a short reading of the source by the author. It is not a quotation and may be wrong. Each sheet names the source it rests on.
- The evidence levels describe what is known about the move's source. They are not a rating of how well the move will work for the person.
- With 8 sheets and no `problem-studied` or `method-published` evidence about the moves themselves, the shop will show many "not tested for this use". That is the true state.
