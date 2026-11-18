# `3211-const-effect-root.svelte`

**Issue:** [#3211](https://github.com/baseballyama/rsvelte/issues/3211)

`$effect.root(…)`, whose lowering unwraps the thunk. The three arms are the whole of what the re-parse skipped
