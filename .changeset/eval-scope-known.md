---
"@rsvelte/compiler": patch
---

Answer "is this expression's value known at compile time" with one port of upstream's `scope.evaluate` instead of two. The client carried its own 230-line structural recursion (`is_expression_known_json`) alongside the server's `Evaluation` port, and the two were cross-recursive — each covered what the other could not. `void <unknown>` is the shape that separates them: upstream gives `void` a single value whatever its operand is, so `{@const c = void p}` with `p` a prop is known and folds, while the client's recursion asked whether the ARGUMENT was known and kept the read reactive.
