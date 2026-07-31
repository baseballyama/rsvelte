//! Browser entry point for the playground, also vendored into
//! `@rsvelte/language-server` (wasm-pack `nodejs` target).
//!
//! Exposes `lint(source, filename)`, `lint_with_config(…)` and `lint_rules()`,
//! thin `#[wasm_bindgen]` wrappers over the engine-only `json_api` functions (shared
//! verbatim with the NAPI export, so native and wasm return byte-identical
//! JSON). The rsvelte_core compiler's own wasm exports (`parse_svelte`,
//! `compile_client`, `compile_server`, `version`) are linked in transitively
//! from this bindings crate too, so a single wasm module serves the whole
//! playground without adding host bindings to `rsvelte_core`.

use wasm_bindgen::prelude::*;

/// Lint `source`, returning a JSON array of diagnostics:
/// `[{ "severity", "line", "column", "endLine", "endColumn", "code", "message" }]`.
/// Lines are 1-indexed, columns 0-indexed (UTF-16), matching `rsvelte check`.
#[wasm_bindgen]
pub fn lint(source: &str, filename: &str) -> String {
    rsvelte_lint::json_api::lint(source, filename)
}

/// [`lint`] under the text of a `rsvelte-lint.json`. Wasm has no filesystem, so
/// the host (the language server) discovers the config file and passes its
/// contents in; `""` selects the recommended preset.
#[wasm_bindgen]
pub fn lint_with_config(source: &str, filename: &str, config: &str) -> String {
    rsvelte_lint::json_api::lint_with_config(source, filename, config)
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
