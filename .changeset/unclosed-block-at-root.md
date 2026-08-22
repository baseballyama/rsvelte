---
'@rsvelte/compiler': patch
---

Raise `block_unclosed` for an `{#each}`, `{#await}`, `{#key}` or `{#snippet}` left open at the fragment root — the block-stack entry was popped unconditionally at end of input, so a truncated template compiled into a component missing everything after the block head
