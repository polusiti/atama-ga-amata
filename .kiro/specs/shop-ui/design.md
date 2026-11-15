# Shop UI: design

## Structure
- `src/core/engine.ts`: add `replayBelief(kb, statedId, entries)`. The belief is always derived from the list of answers, so undo (requirement 4) is exact. Property: replaying a prefix equals the belief after that many sequential updates.
- `src/app/strings.ts`: all UI text, Japanese and English.
- `src/app/parts.tsx`: Pumpkin, BrowserFrame (menu bar, toolbar, address bar, status bar).
- `src/app/Shop.tsx`: state and the three-column page (sidebar, shelf, right rail), cart tab, home tab, about tab.
- `src/app/globals.css`: desktop, browser chrome, 1999 page styles. 98.css supplies window widgets.

## State
`stated`, `entries[]`, `cartId`, `tab`, `lang`. Everything else is derived with `useMemo`.

## Layout
Tabs: Home, Shop, Cart, About. Shop tab has a left sidebar (current question as plain links, answer history with undo), a center shelf (ranked items, add-to-cart), a right rail (Coffin Box, inferred needs, gap warning, math details). Below 820 px the columns stack.

## Visual language
Late 1990s: Verdana/MS PGothic, blue underlined links, bordered tables, colored tabs (orange, purple, green, gray), pixel pumpkin. Halloween: Tab Insanity and Gold Box become jokes (a cursed ever-growing tab bar, "Coffin Box").

## Risks
- Showing results early can anchor the user. The persuasion audit stays. Option order counterbalancing is still open (see docs/assumptions.md).
- Amazon-era styling must stay an homage: fictional store, no marks.
