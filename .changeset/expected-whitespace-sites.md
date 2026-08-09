---
"@rsvelte/compiler": patch
---

Raise `expected_whitespace` at the block, clause and tag headers that require a separator (`{#if}`, `{#each}`, `{#await}`, `{#key}`, `{#snippet}`, `{:else if}`, `{:then}`, `{:catch}`, `{@html}`, `{@const}`, `{@render}`, `{@attach}`), and stop requiring one after `{@debug}`, which the official compiler allows
