---
"@rsvelte/compiler": patch
---

Break an over-width object, array, parameter list, import-specifier list or
destructuring pattern that has exactly one member, matching the official compiler.
esrap applies one width rule at every arity; rsvelte's one-item fast path measured
the member and never compared it, so a single-member literal stayed on one line
however long it got.
