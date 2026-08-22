---
"@rsvelte/compiler": patch
---

Lower the `$effect.pending` / `$state.eager` family the way the official compiler does. `$effect.pending()` emitted `$.eager(() => $.pending())` where the official compiler emits `$.eager($.pending)` — its `thunk` builder drops the arrow around a zero-argument call of an identifier — and `$state.eager(f())` had the same extra arrow. `$state.eager(x)` was not lowered at all in a `<script module>` or `.svelte.(js|ts)` file, leaving a reference to an undefined global in the output. And the server module path reused the client lowering, so server output called the client-only `$.eager` / `$.pending`; it now folds to `0`, or `void 0` as a declarator initializer.
