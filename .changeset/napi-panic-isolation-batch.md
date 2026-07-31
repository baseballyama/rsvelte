---
"@rsvelte/compiler": patch
---

`compileBatch` / `compileBatchExternalSources` (and their async variants) now isolate a panic to the one offending item instead of losing the whole batch's results. Rayon re-raises a worker panic in the caller only after the whole parallel pass finishes, which previously discarded every other file's already-computed output along with the panicking one; each batch item is now caught individually. `CompileError` gains a new `Panic(String)` variant for this case — a source-breaking change for any exhaustive match on `CompileError` outside this crate.
