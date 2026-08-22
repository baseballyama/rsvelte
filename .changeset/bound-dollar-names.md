---
'@rsvelte/compiler': patch
---

Stop rejecting a `$` or `$$`-prefixed name that is bound rather than referenced — a function, arrow, `catch` or snippet parameter, or an `{#each}` item — as `global_reference_invalid`
