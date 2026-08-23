---
'@rsvelte/compiler': patch
---

Treat a nested `$inspect(…)` exactly like a top-level one

Upstream's server `CallExpression` visitor is tree-wide, so how deep the call
sits is not part of its decision. rsvelte handled only the top-level statement:
in dev a call inside a function, an arrow, a bare block, an `if`, a `try`, a
loop or a class method was removed instead of lowered, so the `console.log` the
rune exists for never ran; and in prod the removed statement left nothing on the
server and one `;` on the client where upstream keeps the `ExpressionStatement`
with an empty expression and prints `;;`.

`$effect` / `$effect.pre` / `$effect.root` / `$inspect.trace` are still removed
at every depth in every mode.
