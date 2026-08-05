---
"@rsvelte/compiler": patch
---

Give each dev `$$ownership_validator.mutation(...)` the source position of the mutation it actually wraps when a prop is written more than once through the same member path, and read a member chain that goes through a TypeScript non-null assertion or an optional access.
