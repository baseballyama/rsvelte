# `3234-transition-store-name.svelte`

**Issue:** [#3234](https://github.com/baseballyama/rsvelte/issues/3234)

`transition:$store` — the store is the directive's NAME, not its expression, so the subscription collector never saw it and the output referenced an undeclared `$store`
