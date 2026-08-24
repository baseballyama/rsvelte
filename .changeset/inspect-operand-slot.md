---
'@rsvelte/compiler': patch
---

Fill the slot a removed `$inspect(…)` leaves behind when it is an operand rather than a statement, instead of leaving the call in place for a `ReferenceError` at run time.
