# `unary-snippet-parameter-default.svelte`

**Issue:** [#4386](https://github.com/baseballyama/rsvelte/issues/4386)

Upstream's `is_simple_expression` has no `UnaryExpression` arm, so `-1` is not simple and a snippet parameter default takes the lazy `$.fallback(v, () => d, true)` arm. rsvelte had that arm in **two** ports — the snippet host and the `{#each}` destructure host — and each answered for its own host only, so fixing one leaves the other. The eleven unary shapes are crossed with the three non-unary controls (`1`, `x ? 1 : 2`, `o.k`) that pin the eager, recursing and not-simple sides of the same predicate, in both hosts.
