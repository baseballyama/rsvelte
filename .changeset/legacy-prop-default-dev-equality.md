---
"@rsvelte/compiler": patch
---

A legacy `export let` default holding an equality operator is lazy in dev only

Upstream runs `is_simple_expression` on the visited default, and dev rewrites `===` / `!==` /
`==` / `!=` into `$.strict_equals` / `$.equals` calls — so the same default is eager in
production and thunked in dev. The scan deciding it also read a `(` after an operator as a
call, which made `a || (b === 'x')` lazy in production where official is eager.
