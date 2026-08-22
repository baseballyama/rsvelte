---
"@rsvelte/compiler": patch
---

Stop treating every element with no siblings as having incomplete sibling data when the component holds one non-exhaustive `{#await}` block. The sibling walk is faithful through `{#if}`, `{#each}`, `{#await}` and `{#key}` — an inexhaustive branch demotes a sibling to "probable" rather than dropping it — so the conservative fallback now asks whether the element itself sits where the walk stops, instead of asking whether the component contains such a block anywhere. `.b + .a` with `.a` inside `.b`'s `{#await ... then}` body is pruned, as upstream prunes it.
