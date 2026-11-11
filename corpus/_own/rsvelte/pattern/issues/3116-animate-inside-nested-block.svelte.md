# `3116-animate-inside-nested-block.svelte`

**Issue:** [#3116](https://github.com/baseballyama/rsvelte/issues/3116)

The other direction of the same rule: only a `RegularElement` marked "an element intervened", so an `{#if}` / `{#key}` / `{#await}` between the element and its `{#each}` was accepted. The check now tests the immediate fragment owner
