# `3259-3599-3601-client-definedness.svelte`

**Issue:** [#3259](https://github.com/baseballyama/rsvelte/issues/3259), [#3599](https://github.com/baseballyama/rsvelte/issues/3599), [#3601](https://github.com/baseballyama/rsvelte/issues/3601)

The client's three `scope.evaluate(value).is_defined` consumers agree on direct function/binary/unary option values, a title binding whose initializer is binary, and assignment/sequence initializers that upstream deliberately leaves UNKNOWN. The object-valued option is the opposite-direction control.
