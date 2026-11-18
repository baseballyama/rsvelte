# `3298-nested-const-tag-global-call.svelte`

**Issue:** [#3298](https://github.com/baseballyama/rsvelte/issues/3298)

A nested `{@const}` read through a pure global call is evaluated from the binding initializer, not blocked by template call flags.
