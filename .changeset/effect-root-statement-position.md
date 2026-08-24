---
'@rsvelte/compiler': patch
---

Decide an `$effect.root(…)` statement's position from the previous token

`strip_effects_from_source` asked whether the call starts its own physical line,
which is a different question from the one upstream answers off the AST: an
`ExpressionStatement` whose expression is the call is removed, and a call
anywhere else becomes the `() => {}` no-op. A statement that merely shares a line
(`let m = 1; $effect.root(…);`) was therefore lowered as an expression and left a
`() => {};` behind in the server output.
