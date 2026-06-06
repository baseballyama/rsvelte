---
"@rsvelte/compiler": patch
---

fix(transform): make destructured-derived name counters call-local

`expand_destructured_derived` in the server transform generated its `$$derived_array` / `$$d` helper names using function-level `static` `AtomicUsize` counters, reset with `store(0)` at the top of each call. Those statics are process-global and shared across threads, so concurrent compiles (e.g. a rayon-parallel consumer) raced — one compile's reset/increment clobbered another's, producing nondeterministic `$$derived_array_N` numbering in server output. The counters are now call-local `let` bindings, so each compile gets its own and server output is deterministic under parallel compilation.
