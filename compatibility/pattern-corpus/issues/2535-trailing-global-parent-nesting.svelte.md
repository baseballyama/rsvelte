# `2535-trailing-global-parent-nesting.svelte`

**Issue:** [#2535](https://github.com/baseballyama/rsvelte/issues/2535)

A nested rule whose **parent** prelude ends in `:global(...)`. The parent links to the child through `get_relative_selectors`, which truncates the trailing global first, so `.a :global(.g) { .b { … } }` requires `.b` under `.a`
