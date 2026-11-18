# `3322-new-expression-state-argument.svelte`

**Issue:** [#3322](https://github.com/baseballyama/rsvelte/issues/3322)

The control: a reassigned `$state` as the argument, which must STILL be reactive. Without it the fix reads as "a `new` is never reactive" rather than "a `new` contributes nothing of its own"
