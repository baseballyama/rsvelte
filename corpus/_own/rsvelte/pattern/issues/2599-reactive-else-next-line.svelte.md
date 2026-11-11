# `2599-reactive-else-next-line.svelte`

**Issue:** [#2599](https://github.com/baseballyama/rsvelte/pull/2599)

A `$:` whose `if` header and `else` clause are on **separate lines** — the client instance-script line accumulator decides where a statement ends by looking at what the next line starts with, and its continuation set (`.`, `?`, `:`, `&&`, `||`, `??`) had no entry for the `else` keyword, so the statement was closed after the `if` and the `else` fell outside the reactive body
