---
"@rsvelte/compiler": patch
---

Hoist `{#snippet}` declarations in every container upstream svelte2tsx hoists in. The port wired `hoist_snippet_blocks` into a plain element, an `{#each}` body and the `{#if}` arms; upstream queues *every* non-root parent of a snippet and skips only a component and `<svelte:boundary>`. `{#key}`, the `{:else}` of an `{#each}`, all three `{#await}` branches, a `{#snippet}` body, `<svelte:element>`, `<svelte:head>` and `<svelte:fragment slot>` were missing, so a `{@const}` written before a snippet in any of them landed before it in the TSX instead of after.
