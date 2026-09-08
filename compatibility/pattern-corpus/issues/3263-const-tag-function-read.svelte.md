# `3263-const-tag-function-read.svelte`

**Issue:** [#3263](https://github.com/baseballyama/rsvelte/issues/3263)

`{@const c = fn}` read as text stays reactive because a function-valued binding is not a known scalar value.
