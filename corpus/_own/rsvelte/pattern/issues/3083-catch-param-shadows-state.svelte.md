# `3083-catch-param-shadows-state.svelte`

**Issue:** [#3083](https://github.com/baseballyama/rsvelte/issues/3083)

A `catch` parameter named after a `$state` variable resolved to the state binding, so both the parameter and every use of it inside the clause reported `state_referenced_locally`. `scope_builder` did declare the parameter into a clause scope; what was missing is registering that scope in `function_scope_map`, which is the only way the Phase-2 walker enters one. The file also carries the mutation half — `catch (c) { c = 2 }` over an outer `const c`, which the same resolution feeds
