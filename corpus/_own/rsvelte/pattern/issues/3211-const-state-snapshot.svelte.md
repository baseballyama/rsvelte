# `3211-const-state-snapshot.svelte`

**Issue:** [#3211](https://github.com/baseballyama/rsvelte/issues/3211)

`{@const c = $state.snapshot(…)}` on the SERVER. The const visitor re-parses its source slice, which bypasses `visit_expr` and with it the rune lowering, so the output referenced `$state` and threw on the first render — output that parses, which is why only equality can see it
