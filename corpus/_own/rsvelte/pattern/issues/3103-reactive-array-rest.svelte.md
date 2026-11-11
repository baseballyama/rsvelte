# `3103-reactive-array-rest.svelte`

**Issue:** [#3103](https://github.com/baseballyama/rsvelte/issues/3103)

A rest element in a legacy `$:` **array** destructure was never collected as an implicit reactive declaration, so the output assigned to an undeclared name — a `ReferenceError` at render, not a formatting difference. The object-pattern forms were already collected, which is what isolated the array branch; the file carries all three
