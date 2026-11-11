# `3089-function-declaration-is-defined.svelte`

**Issue:** [#3089](https://github.com/baseballyama/rsvelte/issues/3089)

A function *declaration* in a template interpolation kept a `?? ''` guard. `scope.declare(node.id, 'normal', 'function', node)` records the declaration as the binding's initial, which evaluates to FUNCTION — defined — so upstream reads it bare. The file also carries the two shapes that already worked, a `const` arrow and a reassigned one
