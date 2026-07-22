//! N-API bindings for the rsvelte linter.
//!
//! Thin wrappers over the engine-only `rsvelte_lint::json_api` functions — the
//! SAME functions the wasm export ([`crate::wasm`]) calls — so the native
//! `.node` addon and the wasm module return byte-identical JSON. Shipped inside
//! the per-platform `@rsvelte/lint-<triple>` packages as `rsvelte_lint.node` and
//! loaded (native-first, wasm-fallback) by `@rsvelte/oxlint-plugin`.
//!
//! The `js_name` on each export pins the snake_case names (`lint`,
//! `lint_rules`) so callers use one property name regardless of engine — napi
//! would otherwise camelCase `lint_rules` to `lintRules`.
//!
//! `catch_unwind` on each export is load-bearing, not decorative: napi-rs only
//! wraps a `#[napi]` function body in `std::panic::catch_unwind` when this flag
//! is present (see `napi-derive-backend`'s `codegen/fn.rs`). Without it a panic
//! unwinds straight across the generated `extern "C"` boundary — which, under the
//! `dist-lint` profile's `panic = "unwind"`, aborts the entire Node/oxlint
//! process rather than surfacing as a per-call error. With it, a panic in
//! `compile()` or a rule visitor becomes a thrown JS error the plugin can handle,
//! so one pathological `.svelte` file cannot take down the whole lint run.
//!
//! No `#[global_allocator]` is installed here. This crate's `napi` feature turns
//! on `rsvelte_core/native`, and `rsvelte_core` only installs an allocator at its
//! binary entry points — never at the lib level — so nothing pulls a
//! `#[global_allocator]` into this cdylib. The `.node` addon therefore uses the
//! system allocator, which is inherently dlopen-safe: there is no
//! jemalloc/mimalloc initial-exec TLS block to exhaust when Node loads it.

#![allow(deprecated)]

use napi_derive::napi;

/// Lint `source`, returning the diagnostics JSON array (see
/// `rsvelte_lint::json_api::lint`).
#[napi(js_name = "lint", catch_unwind)]
pub fn lint(source: String, filename: String) -> String {
    rsvelte_lint::json_api::lint(&source, &filename)
}

/// The full catalog of diagnostic ids [`lint`] can emit (see
/// `rsvelte_lint::json_api::lint_rules`).
#[napi(js_name = "lint_rules", catch_unwind)]
pub fn lint_rules() -> String {
    rsvelte_lint::json_api::lint_rules()
}
