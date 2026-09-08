# `3219-closing-tag-eof.svelte`

**Issue:** [#3219](https://github.com/baseballyama/rsvelte/issues/3219)

`</div` with no `>` at end of input. Upstream demands the `>` BEFORE it compares the name, so the tag cannot fall through to end-of-fragment — rsvelte compiled and silently dropped the element
