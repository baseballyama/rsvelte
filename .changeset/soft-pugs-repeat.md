---
'@rsvelte/compiler': patch
---

Carry the `{#each}` block's own scope while building its body and `{:else}` fallback on the client, so an item name that shadows an instance binding resolves to the item. Previously the outer binding answered `is_defined`, which dropped the `?? ''` guard from a concatenated interpolation and constant-folded a fallback read.
