---
"@rsvelte/compiler": patch
---

Legacy (non-runes) destructuring *assignments* (`({ a, ...rest } = obj)`) now lower like the official compiler: an object pattern with an identifier right-hand side stays a plain sequence instead of being wrapped in a `$$value` IIFE, literal and computed keys read `obj['b-c']` / `obj[3]` / `obj[key]` instead of the unparseable `obj.'b-c'`, and the `$.exclude_from_object` key list uses upstream's `b.literal(...)` / `String(<expr>)` form instead of re-quoting the source text (`''b-c''`, `'[key]'`). The invalid member reads used to make the downstream AST pass bail, dropping every `$.set` / prop call in the statement.
