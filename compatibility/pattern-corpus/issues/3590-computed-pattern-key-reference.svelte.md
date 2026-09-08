# `3590-computed-pattern-key-reference.svelte`

**Issue:** [#3590](https://github.com/baseballyama/rsvelte/issues/3590)

A `$state` read used as the computed key of an `ObjectPattern` emitted no `state_referenced_locally` warning. The analyzer approximated upstream's `node !== binding.node` check with the full declarator-pattern range, classifying both real bindings and expressions inside the pattern as declarations; the binding's exact `declaration_start` separates them
