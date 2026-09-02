---
'@rsvelte/compiler': patch
---

A method call in an assignment target's chain is not a mutation, and a mutation nested in a `$:` right-hand side is one
