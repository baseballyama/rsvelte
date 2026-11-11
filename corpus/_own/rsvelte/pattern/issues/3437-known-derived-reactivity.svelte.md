# `3437-known-derived-reactivity.svelte`

**Issue:** [#3437](https://github.com/baseballyama/rsvelte/issues/3437)

Phase 2 must apply upstream's complete Identifier `has_state` condition, including `!scope.evaluate(node).is_known`: direct, expression-bodied, and transitively known deriveds are one-shot reads, while a block-bodied `$derived.by` is the UNKNOWN control
