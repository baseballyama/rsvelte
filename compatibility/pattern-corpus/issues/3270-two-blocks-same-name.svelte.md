# `3270-two-blocks-same-name.svelte`

**Issue:** [#3270](https://github.com/baseballyama/rsvelte/issues/3270)

The same `$derived` name declared in two sibling blocks. This is what prices the per-statement frame: without it the first block's name outlives it and the second block's read is wrapped against the wrong declaration
