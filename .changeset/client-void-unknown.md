---
"@rsvelte/compiler": patch
---

Fold client template expressions through the shared typed evaluator so `void` of an unknown operand has the known value `undefined`, dev equality expressions in binding initializers remain foldable, `{@const}` uses the complete globals table, and aliases of function declarations retain their unknown marker.
