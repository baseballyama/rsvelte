---
"@rsvelte/compiler": patch
---

parse: `super` is legal wherever acorn enters `SCOPE_SUPER`, not only in a method

`super.x` was rejected with `'super' keyword outside a method` inside a class field
initializer, a class static block, and an object literal getter or setter — all
valid JavaScript, all accepted by official Svelte, and all reported by a user
against `compileModule` and `compile` alike (#4549).

The site is `expression.rs`'s own `Scan`, not the OXC allow-list in
`early_errors.rs`: `SemanticBuilder` reports nothing for any of these cells. The
scan set `super_allowed` from method definitions and object-literal shorthand
methods only, where acorn enters `SCOPE_SUPER` from `parseMethod` (which
getters and setters also go through), from `parseClassField` around the
**initializer only**, and from `parseClassStaticBlock`.

`SCOPE_DIRECT_SUPER` is ported with it, so a `super()` call in a field
initializer or a static block now says `super() call outside constructor of a
subclass` where it said `'super' keyword outside a method`. acorn checks
`allowSuper` at the `super` token and `allowDirectSuper` only after the `(`, so
a bare `super()` in a plain function keeps the first message.

Over the 20 shapes acorn's own list generates, rsvelte agreed with official on
12 and now agrees on all 20. A computed key still rejects, because acorn enters
the scope for a field's value and not for its key, and a `function` expression
still rejects everywhere — it makes its own `[[HomeObject]]`.
