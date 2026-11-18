# `3120-global-arg-selector-tokens.svelte`

**Issue:** [#3120](https://github.com/baseballyama/rsvelte/issues/3120)

Upstream parses a pseudo-class argument with the same recursive `read_selector`, so `:global(@keyframes s)` / `:global(%x)` / `:global(1x)` are rejected there exactly as outside; rsvelte discarded every diagnostic its sub-parser raised except the nesting bound. Un-discarding them exposed the real gap the discard had been hiding — namespace selectors (`ns\|el`, `*\|el`) were never implemented
