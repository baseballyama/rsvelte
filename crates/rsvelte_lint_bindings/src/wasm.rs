//! Browser entry point for the playground.
//!
//! Exposes `lint(source, filename)` and `lint_rules()`, thin `#[wasm_bindgen]`
//! wrappers over the engine-only `rsvelte_lint::json_api` functions (shared
//! verbatim with the NAPI export, so native and wasm return byte-identical
//! JSON). The rsvelte_core compiler's own wasm exports (`parse_svelte`,
//! `compile_client`, `compile_server`, `version`) are linked in transitively
//! from the `rsvelte_core/wasm` dependency, so a single wasm module serves the
//! whole playground.

use wasm_bindgen::prelude::*;

/// Lint `source`, returning a JSON array of diagnostics:
/// `[{ "severity", "line", "column", "endLine", "endColumn", "code", "message" }]`.
/// Lines are 1-indexed, columns 0-indexed (UTF-16), matching `rsvelte check`.
#[wasm_bindgen]
pub fn lint(source: &str, filename: &str) -> String {
    rsvelte_lint::json_api::lint(source, filename)
}

/// The rsvelte-lint crate version (for the playground UI).
#[wasm_bindgen]
pub fn lint_version() -> String {
    rsvelte_lint::CRATE_VERSION.to_string()
}

/// The full catalog of diagnostic ids [`lint`] can emit (see
/// `rsvelte_lint::json_api::lint_rules`).
#[wasm_bindgen]
pub fn lint_rules() -> String {
    rsvelte_lint::json_api::lint_rules()
}
