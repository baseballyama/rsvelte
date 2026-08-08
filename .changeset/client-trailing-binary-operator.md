---
'@rsvelte/compiler': patch
---

Keep the operand that follows a line-ending binary operator in a legacy instance script. `let flag = a ||` and `$: v = x ===` with the right operand on the next line closed the statement early, emitting `$.mutable_source(a ||)` / `$.set(v, x ===)` — output no JavaScript parser accepts.
