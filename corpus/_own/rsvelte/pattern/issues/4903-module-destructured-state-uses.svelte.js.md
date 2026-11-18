# `4903-module-destructured-state-uses.svelte.js`

**Issue:** [#4903](https://github.com/baseballyama/rsvelte/issues/4903)

`compileModule` (client): reads and writes of a name bound by a destructured `$state` / `$state.raw` declarator were left bare (`y += 1` instead of `$.set(y, $.get(y) + 1)`), while the declarator itself was lowered. Covers array, nested array, object with rest, `$state.raw`, a function-local declarator, and a parameter that shadows a state name.
