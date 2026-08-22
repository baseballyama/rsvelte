---
"@rsvelte/compiler": patch
---

Let a `catch` clause's parameter shadow an outer binding of the same name. The clause's scope was built and the parameter declared into it, but the scope was never registered where the Phase-2 walker looks one up, so `catch (x)` over an outer `let x = $state(0)` resolved both the parameter and every use of it to the state binding and reported `state_referenced_locally` for each.
