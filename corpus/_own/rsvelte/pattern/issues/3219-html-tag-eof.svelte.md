# `3219-html-tag-eof.svelte`

**Issue:** [#3219](https://github.com/baseballyama/rsvelte/issues/3219)

`{@html v` with no `}`. rsvelte locates a mustache's close by scanning for the brace and fell back to end-of-input when there was none; upstream lets the JS parser consume one expression and demands the brace where it stopped
