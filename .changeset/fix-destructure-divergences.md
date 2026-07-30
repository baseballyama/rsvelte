---
"@rsvelte/compiler": patch
---

Fix seven client-codegen divergences in destructuring: computed and quoted keys in a destructured `$derived` or `$state(...)` now use bracket notation and are subtracted from the rest's `$.exclude_from_object`; default values in a destructured `$state(...)` are no longer dropped; a `...rest` in a destructured `$state(...)` now emits `$.exclude_from_object` instead of reading a property named after itself; an array-destructured `$derived(props)` passes the `$props()` binding to `$.to_array` instead of `$$props`; `$.to_array` no longer receives a length when the array pattern has a rest element; and a comma inside a default value no longer splits the property
