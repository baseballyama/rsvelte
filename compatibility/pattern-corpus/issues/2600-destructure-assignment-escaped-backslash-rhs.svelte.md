# `2600-destructure-assignment-escaped-backslash-rhs.svelte`

**Issue:** [#2600](https://github.com/baseballyama/rsvelte/issues/2600)

`[a, b] = ["\\", 2]` with `$state` targets — the destructure RHS-end scan swallowed the closing `]` and the `;`, so the lowered IIFE received an argument text that carried the statement terminator
