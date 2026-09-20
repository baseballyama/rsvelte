---
'@rsvelte/compiler': patch
'@rsvelte/svelte2tsx': patch
'@rsvelte/svelte-check': patch
---

svelte2tsx: relocate the `this={…}` expression of `<svelte:component>` / `<svelte:element>` instead of baking it, so both it and the attributes written before it keep their source mappings
