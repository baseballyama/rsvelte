//! WebAssembly bindings for the rsvelte Svelte formatter.
//!
//! Wraps [`rsvelte_formatter::format`] so the formatter runs in the browser
//! (e.g. the docs playground's `fmt` tool). Like the `svelte2tsx` wasm
//! binding in `rsvelte_core`, the boundary stays at primitive types:
//! `options_json` and the return value are JSON strings, so no bespoke
//! `wasm_bindgen` struct is needed.
//!
//! Note: the `<style>` formatter callback is `None` here. The CLI wires that
//! up to spawn `oxfmt`, which is a native subprocess and cannot run in a
//! browser — so `<style>` bodies survive verbatim, matching the CLI's own
//! WASM limitation.

use rsvelte_formatter::{
    FormatOptions, IndentStyle, IndentWidth, JsFormatOptions, LineWidth, format,
};
use serde_json::Value;
use wasm_bindgen::prelude::*;

/// Initialize the panic hook for readable errors in the browser console.
#[wasm_bindgen(start)]
pub fn init() {
    console_error_panic_hook::set_once();
}

/// Get the formatter crate version.
#[wasm_bindgen]
pub fn version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

/// Format a `.svelte` source string. Returns a JSON string:
///
/// ```json
/// { "success": true, "code": "<formatted source>" }
/// { "success": false, "error": "<message>" }
/// ```
///
/// `options_json` accepts the same knobs as `.oxfmtrc` (all optional):
/// `useTabs` (bool), `tabWidth` (number), `printWidth` (number).
#[wasm_bindgen]
pub fn format_svelte(source: &str, options_json: &str) -> String {
    let options = parse_options(options_json);
    match format(source, &options) {
        Ok(code) => serde_json::json!({ "success": true, "code": code }).to_string(),
        Err(e) => serde_json::json!({ "success": false, "error": format!("{e}") }).to_string(),
    }
}

/// Parse the JSON options blob into [`FormatOptions`]. Unknown / missing keys
/// fall back to the formatter defaults. Mirrors `build_format_options` in the
/// `rsvelte-fmt` CLI, minus the native-only `<style>` formatter callback.
fn parse_options(options_json: &str) -> FormatOptions {
    let mut js = JsFormatOptions::new();

    let value = serde_json::from_str::<serde_json::Value>(options_json).unwrap_or(Value::Null);
    let obj = value.as_object();
    let get_bool = |k: &str| obj.and_then(|o| o.get(k)).and_then(Value::as_bool);
    let get_u64 = |k: &str| obj.and_then(|o| o.get(k)).and_then(Value::as_u64);

    js.indent_style = if get_bool("useTabs").unwrap_or(false) {
        IndentStyle::Tab
    } else {
        IndentStyle::Space
    };
    if let Some(width) = get_u64("tabWidth").and_then(|w| IndentWidth::try_from(w as u8).ok()) {
        js.indent_width = width;
    }
    if let Some(width) = get_u64("printWidth").and_then(|w| LineWidth::try_from(w as u16).ok()) {
        js.line_width = width;
    }

    FormatOptions {
        js,
        style_formatter: None,
        // `format` re-derives this per-document from `<script lang="ts">`.
        typescript: false,
    }
}
