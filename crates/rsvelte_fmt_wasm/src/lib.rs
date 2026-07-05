//! WebAssembly bindings for the rsvelte Svelte formatter.
//!
//! Wraps [`rsvelte_formatter::format`] so the formatter runs in the browser
//! (e.g. the docs playground's `fmt` tool). Like the `svelte2tsx` wasm
//! binding in `rsvelte_core`, the boundary stays at primitive types:
//! `options_json` and the return value are JSON strings, so no bespoke
//! `wasm_bindgen` struct is needed.
//!
//! `<style>` blocks are formatted in-process via `oxc_formatter_css`
//! ([`rsvelte_formatter::native_style_formatter`]) — the same engine `oxfmt`
//! uses — which, unlike spawning the `oxfmt` subprocess, runs in the browser.

use rsvelte_formatter::{
    CssFormatOptions, FormatOptions, IndentStyle, IndentWidth, JsFormatOptions, LineWidth, format,
    native_style_formatter,
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

    // `sortImports: true` reorders imports inside embedded `<script>` (the object
    // form is a CLI/`.oxfmtrc`-only knob; the playground exposes the boolean).
    if get_bool("sortImports").unwrap_or(false) {
        js.sort_imports = Some(rsvelte_formatter::SortImportsOptions::default());
    }

    // The `svelte` object carries prettier-plugin-svelte's knobs.
    let svelte = obj.and_then(|o| o.get("svelte")).and_then(Value::as_object);
    let svelte_bool = |k: &str| svelte.and_then(|s| s.get(k)).and_then(Value::as_bool);
    let sort_order = svelte
        .and_then(|s| s.get("sortOrder"))
        .and_then(Value::as_str)
        .and_then(rsvelte_formatter::SortOrderSpec::parse)
        .unwrap_or_default();

    // Embedded `<style>` blocks format in-process via `oxc_formatter_css`, at the
    // same indent / print width as the `<script>` body (the playground exposes no
    // separate CSS knobs; `singleQuote` etc. stay at their defaults).
    let css = CssFormatOptions {
        indent_style: js.indent_style,
        indent_width: js.indent_width,
        line_width: js.line_width,
        ..CssFormatOptions::default()
    };

    FormatOptions {
        js,
        style_formatter: Some(native_style_formatter(css)),
        // `format` re-derives this per-document from `<script lang="ts">`.
        typescript: false,
        single_attribute_per_line: get_bool("singleAttributePerLine").unwrap_or(false),
        bracket_same_line: get_bool("bracketSameLine").unwrap_or(false),
        allow_shorthand: svelte_bool("allowShorthand").unwrap_or(true),
        indent_script_and_style: svelte_bool("indentScriptAndStyle").unwrap_or(true),
        sort_order,
    }
}
