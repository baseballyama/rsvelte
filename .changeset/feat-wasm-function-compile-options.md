---
"@rsvelte/compiler": minor
---

feat(wasm): support function compile options via a new `compile(source, options)` entry

The wasm compiler now exposes `compile(source, options)`, which accepts the full
compile-options object and resolves the function-form options that the primitive
`compile_client`/`compile_server` entries can't — matching the NAPI shim's
support (PRs #1666/#1667):

- the `parametric` function forms of `customElement`, `css`, and `runes`
  (`({ filename }) => value`), evaluated once at the boundary;
- a `warningFilter` callback, applied natively by the compiler;
- a constant `cssHashOverride` string; and
- a dynamic `cssHash` callback bridged through `js_sys::Function` (wasm compile
  is single-threaded, so the callback runs inline with no threadsafe-function
  marshalling). A callback that throws surfaces as a compile error; a non-string
  return falls back to the default hash.

The result is returned as a JSON string (`{ js, css, warnings, metadata }`);
callbacks are input-only. The existing `compile_client`/`compile_server` entries
are unchanged.
