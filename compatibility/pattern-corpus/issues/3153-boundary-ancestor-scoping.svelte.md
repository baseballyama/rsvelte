# `3153-boundary-ancestor-scoping.svelte`

**Issue:** [#3153](https://github.com/baseballyama/rsvelte/issues/3153)

An ancestor whose matching descendant sits inside `<svelte:boundary>` kept its hash-less `class`, so the emitted `.b.svelte-hash .a` could never match — a silent style loss rather than a wrong string. Descendant and child are both present because the walk feeds both, and one case puts a block inside the boundary: the container that was missed is not the only one on the path
