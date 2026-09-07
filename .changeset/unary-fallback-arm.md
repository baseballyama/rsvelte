---
'@rsvelte/compiler': patch
---

A `UnaryExpression` default on a snippet parameter or an `{#each}` destructure no longer takes
the eager `$.fallback(value, default)` arm. Upstream's `is_simple_expression` has no
`UnaryExpression` arm, so `-1` is not simple and the lazy `$.fallback(value, () => default, true)`
arm is the correct one.
