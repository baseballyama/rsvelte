---
"@rsvelte/compiler": patch
---

fix(compiler): parenthesize a `new` callee when a state read makes its member-spine contain a call

`new deckgl.MapboxOverlay(...)` where `deckgl` is `$state()` rewrites to
`new ($.get(deckgl).MapboxOverlay)(...)` upstream — the callee's member-spine now
contains a `CallExpression` (`$.get(deckgl)`), so `new` requires parentheses or the
trailing `(...)` would parse as the `new` arguments. esrap/codegen apply this for
proper AST `new` nodes, but the legacy `$.get(...)` text-rewrite path
(`ast_state_transform`) emitted the `new` as raw text and skipped it. A
`visit_new_expression` now inserts the parens when the callee's leftmost member-spine
identifier is a state variable.

Clears `svelte-maplibre/.../DeckGlLayer.svelte`, zero corpus regressions.
