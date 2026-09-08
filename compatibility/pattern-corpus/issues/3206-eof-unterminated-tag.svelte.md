# `3206-eof-unterminated-tag.svelte`

**Issue:** [#3206](https://github.com/baseballyama/rsvelte/issues/3206)

`a<b` at end of input. Official points at the last consumed byte because it reads off a right-trimmed template; rsvelte pointed past the trailing newline, one line late
