# `2336-synthesized-invalidation-comment-cursor.svelte`

**Issue:** [#2336](https://github.com/baseballyama/rsvelte/issues/2336)

A separately parsed `$.invalidate_inner_signals` callback is synthesized and must not rewind esrap's cursor into the enclosing function, duplicating its comments
