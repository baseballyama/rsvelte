---
'@rsvelte/compiler': patch
---

fix(compiler): a component `bind:` on an each item invalidates the collection's store

Upstream registers the each-block context's `assign` / `mutate` transforms as
`b.sequence([mutation, ...sequence])`, so a write to the item is always a
sequence and carries `$.invalidate_store($$stores, '$name')` when the collection
is a store subscription. rsvelte applied that only on the element
(`$.bind_value`) path; a component's generated `set value($$value)` emitted the
bare assignment, so `{#each $store.list as item}<Comp bind:value={item.x} />`
mutated the item without notifying the store.
