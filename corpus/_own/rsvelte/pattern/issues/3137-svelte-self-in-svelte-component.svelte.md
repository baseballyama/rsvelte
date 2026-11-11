# `3137-svelte-self-in-svelte-component.svelte`

**Issue:** [#3137](https://github.com/baseballyama/rsvelte/issues/3137)

The other half: `<svelte:component>` licensed a `<svelte:self>` under it, because rsvelte's second escape hatch was `component_depth`, which that element increments too. Upstream's list names `Component` and no other component-like node, so this needs its own file — the first error ends the compile, and one source cannot exhibit two rejections
