# `3212-props-in-template.svelte`

**Issue:** [#3212](https://github.com/baseballyama/rsvelte/issues/3212)

`$props()` in a text tag. Its rule is `ast_type != Instance` rather than a parent test, so it is the row that would still pass if only the parent-based checks were wired up
