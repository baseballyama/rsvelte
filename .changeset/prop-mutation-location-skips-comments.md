---
"@rsvelte/compiler": patch
---

Skip comments and string literals when locating a prop mutation for `$$ownership_validator.mutation(...)`. A `light.foo = value` written inside a comment was consumed as a real mutation, reporting a position that is not a mutation at all and shifting every later mutation onto the wrong one.
