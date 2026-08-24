---
'@rsvelte/compiler': patch
---

Fix four client-side legacy `$:` divergences. Whitespace or a comment between `$` and its colon
left the statement non-reactive (`$ : x = a` ran once at init); a newline after the colon plus a
trailing comment spliced the comment into `$.set(...)` and emitted output no JavaScript parser
accepts; a state read inside an object literal used as a member-expression object
(`$: out = { a: m }.a`) was left untransformed; and a prop read inside an unlabelled block
statement (`{ out = p; }`) was not lowered to its accessor call.
