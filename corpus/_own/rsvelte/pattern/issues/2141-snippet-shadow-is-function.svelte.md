# `2141-snippet-shadow-is-function.svelte`

**Issue:** [#2141](https://github.com/baseballyama/rsvelte/issues/2141)

A block-local `{#snippet}` shadowing a same-named outer `function` still reads as reactive (`is_function()` must resolve to the snippet, not the outer function)
