# `3137-svelte-self-in-await.svelte`

**Issue:** [#3137](https://github.com/baseballyama/rsvelte/issues/3137)

`<svelte:self>` directly inside `{#await}` compiled, where upstream accepts only an `{#if}`, `{#each}`, `{#snippet}` or component as the parent that licenses it. rsvelte counted block depth, and an `{#await}` is a block — the counter was one notch too generous, so the check needs its own depth rather than the block one
