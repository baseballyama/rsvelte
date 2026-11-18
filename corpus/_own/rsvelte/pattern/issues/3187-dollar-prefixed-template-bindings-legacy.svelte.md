# `3187-dollar-prefixed-template-bindings-legacy.svelte`

**Issue:** [#3187](https://github.com/baseballyama/rsvelte/issues/3187)

The same bindings in **legacy** mode. Not a duplicate: the rejection came from a runes-only branch, so a runes-only file would have been repaired by deleting that branch alone — which would have left legacy still rejecting them, since the depth it passed there was the builder's counter rather than the scope's
