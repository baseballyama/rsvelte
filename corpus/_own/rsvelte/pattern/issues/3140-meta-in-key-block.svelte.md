# `3140-meta-in-key-block.svelte`

**Issue:** [#3140](https://github.com/baseballyama/rsvelte/issues/3140)

`<svelte:head>` compiled inside `{#key}`. Upstream tests the immediate parent (`parent.type !== 'Root'`); rsvelte asked three depth counters, and a `{#key}` increments none of them. One container per file because the first error ends the compile
