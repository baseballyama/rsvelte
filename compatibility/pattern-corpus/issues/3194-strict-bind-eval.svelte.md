# `3194-strict-bind-eval.svelte`

**Issue:** [#3194](https://github.com/baseballyama/rsvelte/issues/3194)

`function g(eval)` — binding `eval`, reached through a parameter rather than a declaration so the binding rule is not pinned only where a `let` reaches it
