# `3109-boundary-meta-placement.svelte`

**Issue:** [#3109](https://github.com/baseballyama/rsvelte/issues/3109)

The other half of the same cause: those three depth counters also back the `<svelte:window>` / `<svelte:head>` / `<svelte:options>` placement rule, so rsvelte accepted a meta element inside a boundary that official rejects with `svelte_meta_invalid_placement`
