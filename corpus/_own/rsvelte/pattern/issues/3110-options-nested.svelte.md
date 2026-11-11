# `3110-options-nested.svelte`

**Issue:** [#3110](https://github.com/baseballyama/rsvelte/issues/3110)

`<svelte:options>` is the one root-only tag with no node in the fragment — the parser consumes it into parser state — so the analyzer's placement rule never ran and a nested one was accepted. The duplicate rule had already been moved into the parser for the same reason
