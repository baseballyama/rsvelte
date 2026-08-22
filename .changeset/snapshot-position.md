---
"@rsvelte/compiler": patch
---

Fix two opposite `$state.snapshot` errors in server output. A class field was stripped to its bare argument, aliasing the source object instead of copying it — the official compiler's `PropertyDefinition` visitor handles only `$state` / `$state.raw` / `$derived` / `$derived.by`, so a snapshot falls through to the tree-wide `$.snapshot(…)` wrap. And on the `compileModule` path a declarator initializer kept the wrap unless it was the first declarator, because the strip located the declaration keyword by scanning back over the declarator name; it is now an AST pass.
