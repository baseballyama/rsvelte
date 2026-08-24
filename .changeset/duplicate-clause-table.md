---
"@rsvelte/compiler": patch
---

Decide whether a repeated block clause is legal from one table

`{#if}` and `{#each}` re-create their fragment on every `{:else}`, so a repeat is
accepted and replaces the earlier branch; `{#await}` rejects a second `{:then}`
or `{:catch}` with `block_duplicate_clause`. The two directions were reported as
separate issues pointing opposite ways, because the answer was written at each
parse site rather than once.
