---
"@rsvelte/compiler": patch
---

Give an `{#each}`'s `{:else}` fallback its own scope, as upstream does. A `{@const}` or
`{#snippet}` in the fallback no longer collides with the each item or index (which are not
in scope there), and no longer leaks into the each scope — which had been adding unused
`$$index, $$array` parameters to the each *body* callback.
