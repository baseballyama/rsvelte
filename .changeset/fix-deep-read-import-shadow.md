---
"@rsvelte/compiler": patch
---

fix(transform): don't deep-read-wrap an import shadowed by an each-item

A legacy dependency whose name matches a module import but resolves to a local
each-item / each-index / snippet-param binding was wrapped in
`$.deep_read_state(...)` as if it were the import. It now emits a plain
`$.get(...)` like any each-item, matching the official compiler's scope-resolved
references.
