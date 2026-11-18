# `3212-rune-in-const-tag.svelte`

**Issue:** [#3212](https://github.com/baseballyama/rsvelte/issues/3212)

`$props()` inside `{@const}`, the slot whose single hard-coded check the fix replaces: it covered `$state`/`$derived` and nothing else
