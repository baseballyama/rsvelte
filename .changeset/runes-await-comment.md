---
"@rsvelte/compiler": patch
---

fix(compiler): keep a comment between `await` and its operand in a runes instance script

Dev-mode client output wrapped `await X` as `(await $.track_reactivity_loss(X))()`
by copying the operand from the argument's own span, which begins past any
comment separating it from the `await` keyword. The copy now starts just past
the keyword, matching what upstream preserves by passing the visited node.
