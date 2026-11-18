# `3444-unenumerated-expression-hoist.svelte`

**Issue:** [#3444](https://github.com/baseballyama/rsvelte/issues/3444)

The same defect reached without a render tag at all — an optional member in an `{@const}` initializer and a computed optional member in an expression tag. These land in the predicate's **JSON** copy rather than its typed one, so a fix applied to one port leaves this file diverging
