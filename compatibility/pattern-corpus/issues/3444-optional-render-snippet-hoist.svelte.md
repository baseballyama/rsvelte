# `3444-optional-render-snippet-hoist.svelte`

**Issue:** [#3444](https://github.com/baseballyama/rsvelte/issues/3444)

`{@render inner?.()}` inside a top-level snippet. The hoist predicate enumerated expression kinds and defaulted to "not hoistable", so the `ChainExpression` every `?.` produces pinned the snippet inside the component function; the same render without `?.` hoisted. The `$state`-reading twin is the control — it must stay pinned, because a hoisted snippet loses the bindings it closed over
