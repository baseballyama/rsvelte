# `3322-new-expression-call-callee.svelte`

**Issue:** [#3322](https://github.com/baseballyama/rsvelte/issues/3322)

`{new (getC())()}` — the call sits in the **callee**, not in the arguments, so it is the row that shows both child positions are walked rather than only the argument list
