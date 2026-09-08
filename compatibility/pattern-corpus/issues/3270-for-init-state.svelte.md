# `3270-for-init-state.svelte`

**Issue:** [#3270](https://github.com/baseballyama/rsvelte/issues/3270)

`for (let r = $state(4); …)`. A `for` head declaration is not a `Statement`, so it never reaches the statement visitor and needs its own arm
