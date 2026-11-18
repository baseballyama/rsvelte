# `3269-optional-render-snippet-hoist-nested.svelte`

**Issue:** [#3269](https://github.com/baseballyama/rsvelte/issues/3269)

The same defect through three levels of snippet with an **argument** on the optional render (`{@render inner?.(1)}`). Two levels and a bare `?.()` are one arm of the recursion; the argument list is the other, and neither is reached by the file above
