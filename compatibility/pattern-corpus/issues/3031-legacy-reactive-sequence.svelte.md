# `3031-legacy-reactive-sequence.svelte`

**Issue:** [#3031](https://github.com/baseballyama/rsvelte/issues/3031)

A legacy `$:` statement assigning two reactive variables through one **sequence expression** — splitting at the first `=` swallowed the rest of the sequence into the first assignment's RHS, so `$.set(a, x, $.set(b, y))` gave the first signal three arguments
