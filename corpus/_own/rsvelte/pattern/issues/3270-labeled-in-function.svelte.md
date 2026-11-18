# `3270-labeled-in-function.svelte`

**Issue:** [#3270](https://github.com/baseballyama/rsvelte/issues/3270)

A label **inside** a function body, which is where that rule actually moves: the top-level label already matched by doing nothing, so only this row can tell 'skips labels' from 'never got there'
