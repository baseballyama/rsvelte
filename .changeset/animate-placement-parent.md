---
"@rsvelte/compiler": patch
---

Test `animate:` placement against the element's immediate parent rather than any enclosing `{#each}`, so an `{#if}` / `{#key}` / `{#await}` in between is rejected the way upstream rejects it — and keep the each frame across the `{:else}` fallback, where an `animate:` is legal on the same terms as one in the body.
