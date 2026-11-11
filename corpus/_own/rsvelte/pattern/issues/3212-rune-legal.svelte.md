# `3212-rune-legal.svelte`

**Issue:** [#3212](https://github.com/baseballyama/rsvelte/issues/3212)

The control: `{@const c = $state.snapshot(v)}`, a rune that IS legal in a template expression. The fix rejects at `function_depth == 0` only, and this is what prices that — without it the same delegation rejects every legal rune call in the template
