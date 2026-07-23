---
"@rsvelte/compiler": minor
---

feat(capi): support `cssHash` / `warningFilter` compile callbacks in the C ABI (`crates/rsvelte_capi`)

The C shared library gains two callback-aware entry points,
`rsvelte_compile_with_callbacks` and `rsvelte_compile_module_with_callbacks`,
which resolve the two function-form compile options that can't be expressed as
JSON — completing the C-API half of the function-compile-options work (the wasm
side shipped separately, NAPI in earlier releases):

- **`css_hash`** — a `(userdata, RsvelteCssHashInput) -> RsvelteStr` function
  pointer. The input's `hash` field is the raw digest the compiler's default
  `cssHash` produces (the filename when known, else the CSS; no `svelte-`
  prefix), so `svelte-${hash}` reproduces the default class exactly. Returns a
  borrowed string the library copies immediately; a constant `cssHashOverride`
  in the options JSON still wins.
- **`warning_filter`** — a `(userdata, warning_json, len) -> bool` function
  pointer, applied natively by the compiler for both components and modules.

Callbacks are opt-in via a new `RsvelteCallbacks` struct (any field may be
NULL); the existing `rsvelte_compile` / `rsvelte_compile_module` entry points
are unchanged. `include/rsvelte.h` regenerates via cbindgen.

This does not change the published `@rsvelte/compiler` npm package's runtime
behaviour — it is a parallel C distribution channel. The npm version is bumped
so the new C ABI surface appears in the next release notes.
