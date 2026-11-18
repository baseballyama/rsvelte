# `3132-snippet-hoist-parents.svelte`

**Issue:** [#3132](https://github.com/baseballyama/rsvelte/issues/3132)

svelte2tsx hoisted a `{#snippet}` to the top of its container for a plain element, an `{#each}` body and the `{#if}` arms only, where upstream queues every non-root parent and skips just a component and `<svelte:boundary>`. The file puts a `{@const}` before a snippet in each of the nine containers that were missing, because the two the port already had are exactly the ones a natural repro reaches for
