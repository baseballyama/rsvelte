---
'@rsvelte/compiler': patch
---

fix(esrap): drop the comments a client `.svelte.(js|ts)` module's top level cannot
own, and wrap a call whose last argument is preceded by a line comment. Upstream
hands esrap a builder-made program with no `loc`, so its statement list discards
every pending comment and only a nested body that does carry one re-finds its
own — a file header or a JSDoc block on a top-level `export const` is dropped,
while a comment inside a function, arrow-block or class body survives. The call
wrap is the same anchoring bug the `ReturnStatement` rule had: the test ran
against oxc's preserved parens, so `g((// c\n a))` never went multiline.
`rsvelte_esrap` is released as 0.10.4 and `rsvelte_core` pins the new exact
requirement.
