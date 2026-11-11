# `3270-block-state.svelte`

**Issue:** [#3270](https://github.com/baseballyama/rsvelte/issues/3270)

`$state` inside a bare `{ … }` block on the SERVER. The nested-rune lowering was gated on a flag only a function or arrow body set, so the declaration stayed `$state(1)` and SSR threw `ReferenceError` — the reported shape
