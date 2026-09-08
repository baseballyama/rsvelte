# `legacy-reactive-nested-destructure-order.svelte`

**Issue:** [#3953](https://github.com/baseballyama/rsvelte/pull/3953)

Nested legacy reactive destructuring assignments keep upstream dependency order when the assigned leaves are read by later reactive statements.
