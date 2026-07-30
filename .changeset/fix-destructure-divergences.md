---
"@rsvelte/compiler": patch
---

Fix four client-codegen divergences in destructuring: computed and quoted keys in a destructured `$derived` now use bracket notation and are subtracted from the rest's `$.exclude_from_object`; default values in a destructured `$state(...)` are no longer dropped; an array-destructured `$derived(props)` passes the `$props()` binding to `$.to_array` instead of `$$props`; and a comma inside a default value no longer splits the property
