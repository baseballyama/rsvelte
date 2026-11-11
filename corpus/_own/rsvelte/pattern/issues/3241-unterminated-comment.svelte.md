# `3241-unterminated-comment.svelte`

**Issue:** [#3241](https://github.com/baseballyama/rsvelte/issues/3241)

An unterminated `<!--` followed by more markup. Upstream reads a right-trimmed template, so it runs out of input at the last non-whitespace byte; the tag paths got that in #3206 and the comment reader did not
