---
'@rsvelte/cli': patch
---

`rsvelte typecheck` writes an `{#each}` block as svelte2tsx does, with the index declared in the loop's body. Under `noUnusedLocals`, an unused item or index is now TS6133 at its name, as in svelte-check, instead of TS6198 at the block.
