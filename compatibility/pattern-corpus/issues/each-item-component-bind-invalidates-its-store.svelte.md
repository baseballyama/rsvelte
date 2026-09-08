# `each-item-component-bind-invalidates-its-store.svelte`

**Issue:** corpus residue

Upstream registers the each-block context's `assign` / `mutate` transforms as `b.sequence([mutation, ...sequence])`, so a `bind:` write to the item is always a sequence — parenthesised even when `sequence` is empty — and carries `$.invalidate_store` when the collection is a store subscription. rsvelte applied that only on the element (`$.bind_value`) path, so a component's generated `set value($$value)` mutated the item without notifying the store. The file carries three cells because a fix that always appends the invalidation is wrong on two of them: the `plain` each block gets the parentheses and nothing else, and `outer.value` — a write inside the block whose root is not the item — gets neither.
