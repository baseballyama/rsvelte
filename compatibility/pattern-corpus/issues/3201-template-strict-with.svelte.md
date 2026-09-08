# `3201-template-strict-with.svelte`

**Issue:** [#3201](https://github.com/baseballyama/rsvelte/issues/3201)

`with ({}) {}` inside a text tag. A template expression is strict for the same reason a script is, but it takes a different parse function and none of the acorn-only checks were on it
