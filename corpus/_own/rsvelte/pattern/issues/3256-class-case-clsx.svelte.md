# `3256-class-case-clsx.svelte`

**Issue:** [#3256](https://github.com/baseballyama/rsvelte/issues/3256)

A mixed-case `CLASS={classes}` attribute must use the Phase-2 `needs_clsx` decision from the exact source spelling. Recomputing it from the value in Phase 3 incorrectly wrapped the mixed-case form in `$.clsx`; the lowercase control must retain that wrapper.
