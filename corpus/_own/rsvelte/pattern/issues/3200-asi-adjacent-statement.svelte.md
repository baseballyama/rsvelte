# `3200-asi-adjacent-statement.svelte`

**Issue:** [#3200](https://github.com/baseballyama/rsvelte/issues/3200)

`let first = 1 let second = 2` — two statements on one line with no semicolon. OXC labels the missing semicolon at the INSERTION POINT and acorn throws on the token that could not continue the statement, so the two disagree by however much separates them. The three files here carry a one-space, a comment and a nested-block separator, because a fix that adds a constant offset passes the first and fails the others
