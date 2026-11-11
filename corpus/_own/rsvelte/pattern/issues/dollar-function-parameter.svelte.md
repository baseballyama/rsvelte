# `dollar-function-parameter.svelte`

**Issue:** corpus residue

A `$name` ordinary-function or arrow parameter resolves as that local binding even when an outer `name` binding exists. It must neither create a synthetic store subscription nor trigger `store_invalid_scoped_subscription`.
