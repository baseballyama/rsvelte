---
"@rsvelte/fmt": patch
"@rsvelte/language-server": patch
---

Drop the declarator parentheses the JS printer adds around an assignment used as a `{@const}` body.

`{@const y = h = 0}` was printed `{@const y = (h = 0)}`. The tag's body is formatted by wrapping it as `const <body>;` and handing it to the JS printer, which parenthesizes an assignment in declarator-initializer position; the oracle formats the same body as an expression and neither adds the parentheses nor keeps the source's. Measured against `oxfmt(svelte: true)`, both engines print `const y = (a = b);` for the plain JS statement, so this is rsvelte asking the engine a different question rather than an engine divergence.

Only a top-level assignment initializer is affected: `(h = 0) + 1`, `c ? (h = 0) : 2` and `() => (h = 0)` keep the parentheses they need.
