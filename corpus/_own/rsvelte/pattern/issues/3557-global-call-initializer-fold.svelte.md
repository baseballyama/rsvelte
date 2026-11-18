# `3557-global-call-initializer-fold.svelte`

**Issue:** [#3557](https://github.com/baseballyama/rsvelte/issues/3557)

Pure global calls in binding initializers use the shared evaluator and fold with the same value as direct template expressions.
