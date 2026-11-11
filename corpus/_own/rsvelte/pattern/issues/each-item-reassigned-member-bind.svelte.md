# `each-item-reassigned-member-bind.svelte`

**Issue:** corpus residue

Upstream's each-item read transform answers `collection[index]` for a **reassigned** item at every site, not only where the item is read bare. A `bind:` on a member or a computed member of that item must use the same base, so a sibling `bind:value={item}` (which is what makes the item reassigned) changes how `item.prop` is read.
