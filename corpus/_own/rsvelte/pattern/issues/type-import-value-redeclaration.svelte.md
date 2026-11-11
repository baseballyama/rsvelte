# `type-import-value-redeclaration.svelte`

**Issue:** [#3965](https://github.com/baseballyama/rsvelte/pull/3965)

Type-only imports collide with value declarations exactly where acorn-typescript does, with source-order error selection.
