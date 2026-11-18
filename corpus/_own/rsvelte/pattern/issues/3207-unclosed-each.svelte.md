# `3207-unclosed-each.svelte`

**Issue:** [#3207](https://github.com/baseballyama/rsvelte/issues/3207)

`{#each}` left open at the fragment root. The block-stack entry was popped unconditionally at end-of-input, so `parse()` had nothing left to report `block_unclosed` about — `{#if}` was unaffected because it takes a different close path
