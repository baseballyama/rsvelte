---
'@rsvelte/compiler': patch
'@rsvelte/svelte2tsx': patch
'@rsvelte/svelte-check': patch
---

svelte2tsx: a `use:` action's generated call keeps the action name's and its parameter expression's source ranges, so hovers, diagnostics and inlay hints on an action resolve to the attribute instead of the element's `<`
