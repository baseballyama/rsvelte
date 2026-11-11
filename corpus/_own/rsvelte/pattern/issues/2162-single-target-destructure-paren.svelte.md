# `2162-single-target-destructure-paren.svelte`

**Issue:** [#2162](https://github.com/baseballyama/rsvelte/issues/2162)

A single-target destructuring **assignment** (`({ a } = obj)`, no rest) keeps its wrapping parens — upstream always lowers through a `SequenceExpression`, even with one element, and esrap always self-parenthesizes one
