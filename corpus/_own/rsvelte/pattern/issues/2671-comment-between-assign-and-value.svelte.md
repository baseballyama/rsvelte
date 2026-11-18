# `2671-comment-between-assign-and-value.svelte`

**Issue:** [#2671](https://github.com/baseballyama/rsvelte/issues/2671)

A comment between `=` and its value. The initializer was taken as source text from just after the `=`, so the comment was joined onto the value, the value stopped looking like a literal, and const folding was silently suppressed. Carries both spellings (`/* */` and `//`) because they terminate differently, and both values carry a line continuation so a fix that re-reads the text rather than the node is still caught
