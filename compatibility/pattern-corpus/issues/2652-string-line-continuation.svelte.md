# `2652-string-line-continuation.svelte`

**Issue:** [#2652](https://github.com/baseballyama/rsvelte/issues/2652)

A `'…'` carried across a line break by a backslash. The carried line is string **content**, so the client re-indenter's tab landed inside the value — valid JavaScript computing `a\tb` instead of `ab`, which no parse gate can see. On the server the same literal never entered the constants map, because the joined logical line still held the raw newline and was re-split
