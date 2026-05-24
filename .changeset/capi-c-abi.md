---
"@rsvelte/compiler": minor
---

feat(capi): add C ABI bindings (`crates/rsvelte_capi`) so the rsvelte Svelte compiler can be called from any language with a C FFI

This release introduces a parallel distribution surface: in addition to the existing NAPI-based `@rsvelte/compiler` npm package, the compiler is now also available as a stable C shared library at `crates/rsvelte_capi`. One `cdylib` + one cbindgen-generated `rsvelte.h` lets any language with a C FFI drive the same compiler — UTF-8 JSON in, UTF-8 JSON out, no per-language schema generation.

- **Languages with smoke tests on every PR**: C, Go, Python, Ruby, Zig, PHP, Java (JDK 22+ FFM API). C++/Kotlin/Scala/.NET/Swift are trivially derivable from the same header.
- **API**: `rsvelte_compile`, `rsvelte_compile_module`, plus `*_into` out-parameter variants for hosts that can't pass structs by value (Ruby Fiddle, certain Java/JNI setups). `rsvelte_free` / `rsvelte_free_raw` for cleanup; `rsvelte_version` for the version probe.
- **Options shape**: identical to the existing NAPI `compile()` options (camelCase, all optional).
- **Breaking-change guard**: the build script panics under `RSVELTE_CAPI_CHECK_HEADER=1` if the committed header drifts from cbindgen output, and 35 cargo integration tests assert the JSON envelope shape, header invariants, and observable behaviour of every documented `CompileOption`. CI runs the full matrix (Linux/macOS/Windows × 7 languages) for every PR that touches the C ABI or the compiler.

This does not change the published `@rsvelte/compiler` npm package's runtime behaviour — it is a parallel distribution channel. The npm version is bumped so the C ABI surface appears in the next release notes.

See `crates/rsvelte_capi/README.md` for the full API, JSON envelope shape, memory ownership rules, and per-language quick-start table.
