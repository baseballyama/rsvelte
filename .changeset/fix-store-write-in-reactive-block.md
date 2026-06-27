---
"@rsvelte/compiler": patch
---

fix(transform): lower a store write nested in a reactive block body

A `$store = x` inside a `$:` block body (`$: { … $store = x }`) was not lowered
to `$.store_set(store, x)`; the read wrap then mangled the LHS into `$store() = x`
(invalid JS). The block-body path now runs the store-assignment lowering before
wrapping reads.
