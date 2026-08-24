---
"@rsvelte/compiler": patch
---

Keep a comment written between a declarator's `=` and its rune call inside the lowered
call, the way the official compiler places it: inside `$.tag(...)` for `$state`, inside
`$.proxy(...)` for a non-reactive proxied initializer, inside the synthesized thunk's
parameter parens for `$derived(expr)`, and before the argument for `$derived.by(fn)`.
