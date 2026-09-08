# `3618-inspect-trace-function-label.svelte`

**Issue:** [#3618](https://github.com/baseballyama/rsvelte/issues/3618), [#3544](https://github.com/baseballyama/rsvelte/issues/3544)

Dev trace labels inherit an arrow declarator's name, retain each class method or constructor's own source position, and async functions await an async trace thunk located from the `async` keyword.
