# `3296-template-scope-shadow-read.svelte`

**Issue:** [#3296](https://github.com/baseballyama/rsvelte/issues/3296)

A template binding that shadows a same-named derived binding remains the lexical read target through a nested `{@const}`.
