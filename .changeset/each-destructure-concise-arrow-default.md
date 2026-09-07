---
'@rsvelte/compiler': patch
---

Keep an `{#each}` destructuring default that is a concise-body arrow concise. `{#each items as { a = () => 1 }}` emitted `() => { 1; }`, a function returning `undefined`, and `() => ({ a: 1 })` emitted a block holding a labelled statement.
