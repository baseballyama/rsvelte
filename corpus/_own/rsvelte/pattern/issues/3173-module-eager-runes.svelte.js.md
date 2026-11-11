# `3173-module-eager-runes.svelte.js`

**Issue:** [#3173](https://github.com/baseballyama/rsvelte/issues/3173)

`$effect.pending()` and `$state.eager()` in every module position that survives compilation — class field, static field, object property. `$state.eager(compute())` is the discriminator for the thunk: upstream's `thunk` drops the arrow around a zero-argument call of an **identifier**, so `$state.eager(o)` keeps its arrow while `$effect.pending()` loses one, and a file carrying only one of the two cannot tell a missing `unthunk` from a spurious one. No declarator appears anywhere: upstream's client `VariableDeclaration` deletes a declarator initialized by either rune, emitting `export ;` — text no JS parser accepts — which rsvelte deliberately does not reproduce (`upstream_issues/3173-*`)
