# `2193-member-target-destructure-nonreactive.svelte`

**Issue:** [#2193](https://github.com/baseballyama/rsvelte/issues/2193)

A destructuring **assignment** with a **member-expression** target (`({ b: o.p } = src)`) whose object (`o`) is a `$state(...)` that itself resolves to a non-signal `$.proxy` — `has_reactive_target` must consult the filtered `reactive_state_set`, not the raw `state_set`, or the assignment gets needlessly lowered through the reactive path instead of staying verbatim
