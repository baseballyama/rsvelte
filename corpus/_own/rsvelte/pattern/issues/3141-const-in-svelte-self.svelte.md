# `3141-const-in-svelte-self.svelte`

**Issue:** [#3141](https://github.com/baseballyama/rsvelte/issues/3141)

`{@const}` directly inside `<svelte:self>` compiled. Upstream's legal-parent list names `Component` and `SvelteComponent` and not this one; rsvelte both folded the three into a single fragment-owner value and never pushed one for `<svelte:self>`, so the tag was judged against the `{#if}` that encloses it — which is legal, and is why the wrapper the element needs anyway had to be part of the repro
