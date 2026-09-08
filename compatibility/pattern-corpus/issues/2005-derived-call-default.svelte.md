# `2005-derived-call-default.svelte`

**Issue:** [#2005](https://github.com/baseballyama/rsvelte/issues/2005)

A **call-expression** destructuring default is unthunked — `$.fallback(…, f, true)`, not `() => f()`
