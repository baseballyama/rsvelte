# `3110-meta-placement-span.svelte`

**Issue:** [#3110](https://github.com/baseballyama/rsvelte/issues/3110)

Upstream raises `svelte_meta_invalid_placement` and `svelte_meta_duplicate` from the parser with a **number**, so `end === start`; rsvelte raised them from the analyzer over the whole element. Only the `end` ratchet can see this, and it is separate from `start` for exactly that reason
