---
'@rsvelte/compiler': patch
---

Reject `bind:` to an expression that names no binding on a **component**, not only on an element. `<Comp bind:value={o.x = obj} />` compiled and was lowered into a getter/setter around the assignment where the official compiler raises `bind_invalid_expression`. The element path's message is now upstream's text too, so a user comparing diagnostics sees the same string.
