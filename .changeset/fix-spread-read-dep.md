---
"@rsvelte/compiler": patch
---

fix(transform): detect a spread `...prop` as a read in legacy reactive deps

`body_references_identifier` excluded a `.` before a name to skip member access,
which also skipped a spread (`...prop`). A `$:` statement that spreads an
imported/prop/state binding therefore dropped that dependency from its
`$.legacy_pre_effect(...)` tracking thunk. A spread prefix is now recognized as a
read.
