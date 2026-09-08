# `3210-continuation-placement.svelte`

**Issue:** [#3210](https://github.com/baseballyama/rsvelte/issues/3210)

`{:else}` with no block open. Upstream's `next()` reports at `parser.index - 1` — the `:` it just ate — so rsvelte's `{` was one column early
