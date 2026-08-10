---
'@rsvelte/compiler': patch
---

Return the official-shaped `CompileError` from the Vite shim's envelope compile
paths, including `compileAsync`, instead of a Rust debug string.
