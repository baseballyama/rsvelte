# `3092-svelte-element-this-with-gt.svelte`

**Issue:** [#3092](https://github.com/baseballyama/rsvelte/issues/3092)

`rsvelte-fmt` re-emitted part of the source as text for `<svelte:element this={n > 0 ? 'p' : 'span'}>`: `this={…}` is not in `attributes`, so the open-tag scan started at `<svelte:element` and stopped at the `>` inside the expression. A regular element and a non-`this` attribute carrying the `>` were both fine, which is what isolated the slot
