# `3194-strict-delete-local.svelte`

**Issue:** [#3194](https://github.com/baseballyama/rsvelte/issues/3194)

`delete e` on a bare identifier. `delete o.a` is in the legal file — the rule is about the operand's shape, not the operator
