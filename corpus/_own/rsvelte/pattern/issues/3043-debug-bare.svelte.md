# `3043-debug-bare.svelte`

**Issue:** [#3043](https://github.com/baseballyama/rsvelte/issues/3043)

A bare `{@debug}` (no arguments) must still emit `console.log({})` before `debugger` on the server — upstream always pushes the log with an empty object
