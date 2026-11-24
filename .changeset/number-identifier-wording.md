---
'@rsvelte/cli': patch
---

`compile` now reports acorn's "Identifier directly after number" for a name right after a number, and "Unexpected token" for a stray digit as in `0b12`, where svelte does.
