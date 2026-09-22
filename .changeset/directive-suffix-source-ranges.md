---
'@rsvelte/compiler': patch
'@rsvelte/svelte2tsx': patch
'@rsvelte/svelte-check': patch
---

svelte2tsx: a `transition:` / `in:` / `out:` / `animate:` directive's own name and its parameter expression keep their source ranges, so every position inside the attribute maps back to itself instead of to the element's `<`
