---
'@rsvelte/cli': patch
---

A `<svelte:options>`, `<svelte:head>`, component or `<slot>` left open at the end of a file now raises `block_unclosed` like Svelte does. A regular element left open raises `element_unclosed`.
