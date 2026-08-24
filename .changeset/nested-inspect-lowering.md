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

Both empty statements are now emitted at every depth, but only the server puts
them where official does. Measured over 5 hosts × 2 targets: the server is
byte-identical in 5/5, and the client writes the two `;` on separate lines at the
same indentation in 5/5 — one shape, no variation, tracked as #3724. oxfmt joins
them, so this is invisible to every corpus gate; the tests here therefore count
the empty statements instead of matching the text, which keeps a vanished hole
and a run of three failing while that split stands.

`$effect` / `$effect.pre` / `$effect.root` / `$inspect.trace` are still removed
at every depth in every mode.
