# `nested-global-local-scope.svelte`

**Issue:** corpus residue

A nested `&:hover` and bare `&` under a fully `:global(...)` parent still scope every possible local match. The pruner retains the child rule's `NestingSelector` and non-global metadata; flattening the selector while inheriting the parent's `is_global` flag truncates the child and omits the component hash. A non-nested global leaf pins the opposite classification.
