# `3210-unterminated-comment.svelte`

**Issue:** [#3210](https://github.com/baseballyama/rsvelte/issues/3210)

`<!-- c` at end of input. `read_until` stops at the end of the RIGHT-TRIMMED template, so the demand for `-->` lands there and not after the file's trailing newline
