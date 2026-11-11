# `3140-meta-in-dynamic-element.svelte`

**Issue:** [#3140](https://github.com/baseballyama/rsvelte/issues/3140)

The same rule against `<svelte:element>`, carrying `<svelte:window>` rather than `<svelte:head>` — the three root-only elements share one predicate, and a file that only ever tries `<svelte:head>` cannot show that
