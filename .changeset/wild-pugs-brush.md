---
'@rsvelte/compiler': patch
---

Apply the member-property guard to compound assignment in the legacy server
`$:` reorder scanner. `extract_simple_assignments` recorded `x` for
`$: obj.x += 1` while recording nothing for `$: obj.x = 1` and `$: obj.x++`,
which invented a reactive dependency and hoisted the statement above any `$:`
that reads a plain `x`. Upstream's `AssignmentExpression` visitor takes the same
branch for every operator and records no target for a member expression.

No change to emitted output: the text scanner is reachable only from the
declaration-tag script path, where a `$:` statement cannot occur, and SSR
reactive ordering runs through the AST port of `order_reactive_statements`,
which was already correct for these shapes.
