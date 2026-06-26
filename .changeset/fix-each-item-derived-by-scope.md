---
"@rsvelte/compiler": patch
---

fix(compiler): don't misresolve a `$derived.by` for-loop variable to an `{#each}` item

A `for`-loop variable inside a `$derived.by(() => { ... })` callback that shared
a name with an `{#each ... as name}` template item triggered a false-positive
`each_item_invalid_assignment` error, rejecting code the official compiler
accepts. The runes-mode each-item check resolved the assignment target with a
scope walk that reaches the pollution-seeded root scope, so it matched the
template each item even though the `{#each}` block is not a lexical ancestor of
the script callback. The error now only fires when the each-item binding's
declaring scope is actually an ancestor of the assignment site.
