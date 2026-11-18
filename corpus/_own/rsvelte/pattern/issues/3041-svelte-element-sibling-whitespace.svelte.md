# `3041-svelte-element-sibling-whitespace.svelte`

**Issue:** [#3041](https://github.com/baseballyama/rsvelte/issues/3041)

Whitespace between sibling `<svelte:element>`s dropped on the server: the namespace walker scored a `SvelteElement` as *inconclusive* instead of reading its phase-2 `metadata.svg/mathml`, so the fragment inferred SVG and applied SVG whitespace trimming — a hydration-mismatch class
