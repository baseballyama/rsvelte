---
"@rsvelte/compiler": patch
---

fix(compiler): fix byte/char index mix in the legacy SSR store-set scan

`extract_store_set_targets` fed a byte offset from a `memmem` match into a
`Vec<char>`, so any non-ASCII before a `$.store_set(` call made it read the
store name from the wrong position and record a truncated dependency.
`extract_simple_assignments` alongside it now skips comments and regex
literals instead of reading assignments out of them.
