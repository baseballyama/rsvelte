---
"@rsvelte/compiler": patch
---

Walk an `UpdateExpression`'s argument during analysis. Upstream ends that visitor with `context.next()`; rsvelte returned without descending, so nothing inside `x++` was ever visited: a component whose only member expression was `p.a++` lost its `$.push($$props, …)` / `$.pop()` pair, and a legacy prop whose only use was `p++` was reported `export_let_unused` while a `$derived` read only through `linked.current++` never raised `state_referenced_locally`.
