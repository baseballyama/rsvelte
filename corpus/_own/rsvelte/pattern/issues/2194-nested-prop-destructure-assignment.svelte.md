# `2194-nested-prop-destructure-assignment.svelte`

**Issue:** [#2194](https://github.com/baseballyama/rsvelte/issues/2194)

A **nested** destructuring **assignment** (`({ a: { value } } = src)`) inside a runes, **props-only**, non-dev script — the `ast_state_transform` source-range path (used when the script has no other reactive declarations to force the text-based transform) previously had no case for nested-destructure prop assignments and left them untransformed
