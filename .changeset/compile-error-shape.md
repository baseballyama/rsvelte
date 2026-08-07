---
'@rsvelte/compiler': patch
---

Throw compile failures as an object shaped like the official compiler's `CompileError` (`name`, `code`, `message`, `filename`, `start`, `end`, `position`) instead of a `GenericFailure` whose message is a Rust `Debug` dump — `compile`, `compileBoth` and `compileModule`
