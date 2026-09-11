---
"@rsvelte/compiler": patch
---

client: a prop read on a member root no longer depends on the source-map option

The rewrite that turns `p.c` into `p().c` for a `$bindable()` prop was gated on
the converted object being a `JsExpr::Spanned`, and that wrapper is built only
under `enable_sourcemap`. With source maps off the read never ran, the update's
base stayed the bare `p`, and a second writer applied the mutate transform again:
`p(p().c++, true)` came out as `p(p(p().c++, true), true)`, which passes the
setter's return value back through the setter (#4570).

The condition now asks about the identifier rather than about the wrapper.
Whether a span wrapper is present is a source-map question; whether the root
needs the prop read is not.

Measured over all 1,389 `.svelte` files of `compatibility/pattern-corpus` x
client/server, 2,536 live units: **0 move** on the default `enable_sourcemap:
true` path — this cannot touch what anyone compiles today — and exactly the two
semantic units move under `--no-sourcemap`, both onto official's answer.
