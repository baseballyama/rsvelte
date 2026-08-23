---
'@rsvelte/compiler': patch
---

Client: fold a `globals` call in a `const`'s initializer through the one table

The client's constant folder carried its own copy of upstream's `globals` table
holding eight `Math.*` names, so `String('a')` and `Math.trunc(-1.7)` folded on
the server and not on the client, and `Math.round` used Rust's
half-away-from-zero rule instead of JS's half-up. It now asks the server's port
of the table, which also gives it the `get_global_keypath` shadowing rule a
name-only match never had.

Separately, `initial_is_non_reactive` evaluated a binding's initializer at
template depth, so it took the `has_call` bail that models upstream memoizing a
template chunk before evaluating it. An initializer is never memoized, so
`const v = Math.max(1, k)` folded to `'5'` through one path and was reported as
reactive state by the other — emitting `text.nodeValue = '5'` into a `<u> </u>`
placeholder instead of `u.textContent = '5'`.
