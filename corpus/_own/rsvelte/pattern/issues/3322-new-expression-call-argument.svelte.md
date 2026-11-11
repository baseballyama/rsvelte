# `3322-new-expression-call-argument.svelte`

**Issue:** [#3322](https://github.com/baseballyama/rsvelte/issues/3322)

`{new String(f())}`, the opposite direction of the same missing arm: `has_call` was NOT propagated out of a `new`, so the chunk got the bare-closure form instead of the dependency-array one. A fix that only stops over-reporting `has_state` leaves this half wrong
