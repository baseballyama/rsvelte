# `3208-duplicate-snippet-nested.svelte`

**Issue:** [#3208](https://github.com/baseballyama/rsvelte/issues/3208)

The same two names with the second inside an `{#if}`, which BOTH compilers accept: a nested snippet is a different scope. The file is what keeps the fix from becoming a name-uniqueness rule over the whole fragment
