---
"@rsvelte/compiler": patch
---

fix(parse): bound parser recursion so deeply nested input errors instead of aborting

Template and CSS nesting recursed without a bound, so input such as a few
hundred nested elements overflowed the stack. That aborts the process
(SIGABRT) rather than panicking, so no embedder — the lint CLI, `svelte-check`,
the NAPI/wasm bindings, the language server — could contain it with
`catch_unwind`; a single such file took down the whole session. Nesting deeper
than 128 levels is now reported as an ordinary diagnostic
(`template_nesting_too_deep` / `css_nesting_too_deep`). Real components nest
around 20 levels, so valid code is unaffected.
