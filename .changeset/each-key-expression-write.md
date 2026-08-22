---
'@rsvelte/compiler': patch
---

Visit an `{#each}` key expression inside the each scope, so a write to the item there (`(v++)`) is recorded as a mutation of the collection and promotes it to reactive state
