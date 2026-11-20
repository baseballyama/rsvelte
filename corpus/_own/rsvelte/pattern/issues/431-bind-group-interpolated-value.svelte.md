# `431-bind-group-interpolated-value.svelte`

**Issue:** [#431](https://github.com/baseballyama/rsvelte/issues/431) (H-038, M-026)

`bind:group` beside a `value` of text and expressions. The client's group getter reads every chunk of the value, unmemoized; a value that folds to a constant string is printed bare, so the official getter opens with a directive. The server checks the input against the same value.
