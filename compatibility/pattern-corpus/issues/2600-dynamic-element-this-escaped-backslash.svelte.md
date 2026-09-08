# `2600-dynamic-element-this-escaped-backslash.svelte`

**Issue:** [#2600](https://github.com/baseballyama/rsvelte/issues/2600)

`<svelte:element this={sep === "\\" ? …}>` — `this` is not in `attributes`, so the opening-tag scan runs over it. The compiler output is identical either way; only the **svelte2tsx** overlay diverges, dropping the child expression (`;;` instead of `n;`) and with it every diagnostic and definition lookup inside that element
