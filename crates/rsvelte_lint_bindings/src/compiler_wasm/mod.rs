//! WebAssembly bindings for the Svelte compiler.
//!
//! This module provides JavaScript-accessible functions for compiling
//! Svelte components in the browser.

use std::sync::{
    Arc, Mutex,
    atomic::{AtomicBool, Ordering},
};

use wasm_bindgen::prelude::*;

use crate::compiler::phases::phase1_parse::{ParseOptions, parse};
use crate::compiler::phases::phase3_transform::css::generate_css_hash;
use crate::compiler::{
    CompileOptions, CompileResult, ComponentApi, CssHashFn, CssHashInput, CssMode,
    ExperimentalOptions, FragmentMode, GenerateMode, Namespace, Warning, WarningFilterFn, compile,
};
use crate::svelte2tsx::{Svelte2TsxOptions, svelte2tsx as rust_svelte2tsx};

/// Initialize panic hook for better error messages in the browser console.
#[wasm_bindgen(start)]
pub fn init() {
    console_error_panic_hook::set_once();
}

/// Result of parsing a Svelte component.
#[wasm_bindgen]
pub struct ParseResultWasm {
    success: bool,
    ast_json: String,
    error: Option<String>,
}

#[wasm_bindgen]
impl ParseResultWasm {
    #[wasm_bindgen(getter)]
    pub fn success(&self) -> bool {
        self.success
    }

    #[wasm_bindgen(getter)]
    pub fn ast(&self) -> String {
        self.ast_json.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn error(&self) -> Option<String> {
        self.error.clone()
    }
}

/// Result of compiling a Svelte component.
#[wasm_bindgen]
pub struct CompileResultWasm {
    success: bool,
    js: String,
    css: String,
    error: Option<String>,
}

#[wasm_bindgen]
impl CompileResultWasm {
    #[wasm_bindgen(getter)]
    pub fn success(&self) -> bool {
        self.success
    }

    #[wasm_bindgen(getter)]
    pub fn js(&self) -> String {
        self.js.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn css(&self) -> String {
        self.css.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn error(&self) -> Option<String> {
        self.error.clone()
    }
}

/// Parse a Svelte component and return the AST as JSON.
#[wasm_bindgen]
pub fn parse_svelte(source: &str) -> ParseResultWasm {
    // Same as the NAPI entry: upstream strips it before the parser, so every
    // position below is relative to the trimmed source.
    let source = crate::compiler::phases::phase1_parse::remove_bom(source);
    let options = ParseOptions::default();

    match parse(source, &oxc_allocator::Allocator::default(), options) {
        Ok(ast) => {
            // Serializing the AST resolves `JsNodeId`s through the thread-local
            // serialize arena; without it the Serialize impls panic ("serialize
            // arena not set"), which surfaces in the browser as a WASM
            // "unreachable" trap.
            let ast_json = crate::ast::arena::with_serialize_arena(&ast.arena, || {
                // Spans are emitted as UTF-16 code-unit offsets to match
                // svelte/compiler (#793). For ASCII source byte == UTF-16, so
                // skip the remap entirely and keep the fast direct-string path.
                if source.is_ascii() {
                    serde_json::to_string_pretty(&ast).unwrap_or_default()
                } else {
                    let mut value = serde_json::to_value(&ast).unwrap_or(serde_json::Value::Null);
                    let conv = crate::compiler::legacy::Utf8ToUtf16::new(source);
                    crate::compiler::legacy::convert_positions_to_utf16(&mut value, &conv);
                    serde_json::to_string_pretty(&value).unwrap_or_default()
                }
            });
            ParseResultWasm {
                success: true,
                ast_json,
                error: None,
            }
        }
        Err(e) => ParseResultWasm {
            success: false,
            ast_json: String::new(),
            error: Some(format!("{:?}", e)),
        },
    }
}

/// Compile a Svelte component to client-side JavaScript.
#[wasm_bindgen]
pub fn compile_client(source: &str, name: &str) -> CompileResultWasm {
    let options = CompileOptions {
        generate: GenerateMode::Client,
        name: Some(name.to_string()),
        css: CssMode::External,
        ..Default::default()
    };

    match compile(source, options) {
        Ok(result) => CompileResultWasm {
            success: true,
            js: result.js.code,
            css: result.css.map(|c| c.code).unwrap_or_default(),
            error: None,
        },
        Err(e) => CompileResultWasm {
            success: false,
            js: String::new(),
            css: String::new(),
            error: Some(format!("{:?}", e)),
        },
    }
}

/// Compile a Svelte component to server-side JavaScript.
#[wasm_bindgen]
pub fn compile_server(source: &str, name: &str) -> CompileResultWasm {
    let options = CompileOptions {
        generate: GenerateMode::Server,
        name: Some(name.to_string()),
        css: CssMode::External,
        ..Default::default()
    };

    match compile(source, options) {
        Ok(result) => CompileResultWasm {
            success: true,
            js: result.js.code,
            css: result.css.map(|c| c.code).unwrap_or_default(),
            error: None,
        },
        Err(e) => CompileResultWasm {
            success: false,
            js: String::new(),
            css: String::new(),
            error: Some(format!("{:?}", e)),
        },
    }
}

/// Get the version of the compiler.
#[wasm_bindgen]
pub fn version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

/// Convert a Svelte component to TypeScript/TSX. Mirrors the napi `svelte2tsx`
/// shape — `options_json` and the return value are JSON strings so the wasm
/// boundary stays at primitive types and no bespoke `wasm_bindgen` struct is
/// needed for every field of `Svelte2TsxResult`.
#[wasm_bindgen]
pub fn svelte2tsx(source: &str, options_json: &str) -> String {
    let opts = parse_svelte2tsx_options(options_json);
    match rust_svelte2tsx(source, opts) {
        Ok(result) => {
            let props: Vec<serde_json::Value> = result
                .exported_names
                .get_prop_names()
                .iter()
                .map(|n: &&str| serde_json::Value::String((*n).to_string()))
                .collect();
            let all: Vec<serde_json::Value> = result
                .exported_names
                .get_all_names()
                .iter()
                .map(|n: &&str| serde_json::Value::String((*n).to_string()))
                .collect();
            let events: Vec<serde_json::Value> = result
                .events
                .get_api_entries()
                .into_iter()
                .map(|(name, ty)| serde_json::json!({ "name": name, "type": ty }))
                .collect();
            let output = serde_json::json!({
                "success": true,
                "code": result.code,
                "map": result.map,
                "exportedNames": { "props": props, "all": all },
                "events": events,
            });
            output.to_string()
        }
        Err(e) => serde_json::json!({
            "success": false,
            "error": format!("{e}"),
        })
        .to_string(),
    }
}

fn parse_svelte2tsx_options(options_json: &str) -> Svelte2TsxOptions {
    let Ok(value) = serde_json::from_str::<serde_json::Value>(options_json) else {
        return Svelte2TsxOptions::default();
    };
    Svelte2TsxOptions::from_json(&value)
}

// === Function-form compile options (issue #1680) ===
//
// `compile(source, options)` accepts the full compile-options object and
// resolves the pieces the primitive `compile_client`/`compile_server` entries
// can't: the function forms of `customElement`/`css`/`runes` (Svelte's
// `parametric()`, evaluated once with `{ filename }`), a `warningFilter`
// callback, a constant `cssHashOverride`, and a dynamic `cssHash` callback.
// wasm compile is single-threaded, so the JS callbacks are invoked inline —
// no threadsafe-function marshalling (unlike the NAPI backend).

// On wasm32 (single-threaded) wasm-bindgen already makes `JsValue`/`Function`
// Send + Sync, so the JS callbacks satisfy the shared `CssHashFn`/
// `WarningFilterFn` bounds directly — the throwing-`cssHash` slot just needs a
// thread-safe container (`Arc<Mutex<…>>`, uncontended here).
type ErrorSlot = Arc<Mutex<Option<String>>>;

fn get_prop(obj: &JsValue, key: &str) -> JsValue {
    js_sys::Reflect::get(obj, &JsValue::from_str(key)).unwrap_or(JsValue::UNDEFINED)
}

const RECOGNISED_COMPILE_OPTIONS: &[&str] = &[
    "filename",
    "rootDir",
    "dev",
    "generate",
    "warningFilter",
    "experimental",
    "accessors",
    "css",
    "cssHash",
    "cssHashOverride",
    "cssOutputFilename",
    "customElement",
    "discloseVersion",
    "immutable",
    "legacy",
    "compatibility",
    "loopGuardTimeout",
    "name",
    "namespace",
    "modernAst",
    "outputFilename",
    "preserveComments",
    "fragments",
    "preserveWhitespace",
    "runes",
    "hmr",
    "sourcemap",
    "enableSourcemap",
    "hydratable",
    "format",
    "tag",
    "sveltePath",
    "errorMode",
    "varsReport",
];

fn present(value: &JsValue) -> bool {
    !value.is_undefined()
}

fn invalid_option(detail: impl std::fmt::Display) -> String {
    format!("Invalid compiler option: {detail}\nhttps://svelte.dev/e/options_invalid_value")
}

fn option_error_to_js(message: String) -> JsValue {
    let error = js_sys::Error::new(&message);
    error.set_name("CompileError");
    let code = if message.contains("/options_unrecognised") {
        "options_unrecognised"
    } else if message.contains("/options_removed") {
        "options_removed"
    } else {
        "options_invalid_value"
    };
    let _ = js_sys::Reflect::set(
        error.as_ref(),
        &JsValue::from_str("code"),
        &JsValue::from_str(code),
    );
    error.into()
}

fn require_bool(options: &JsValue, key: &str) -> Result<Option<bool>, String> {
    let value = get_prop(options, key);
    if !present(&value) {
        return Ok(None);
    }
    value
        .as_bool()
        .map(Some)
        .ok_or_else(|| invalid_option(format!("{key} should be true or false, if specified")))
}

fn require_string(options: &JsValue, key: &str) -> Result<Option<String>, String> {
    let value = get_prop(options, key);
    if !present(&value) {
        return Ok(None);
    }
    value
        .as_string()
        .map(Some)
        .ok_or_else(|| invalid_option(format!("{key} should be a string, if specified")))
}

fn warn_once(flag: &AtomicBool) -> bool {
    !flag.swap(true, Ordering::Relaxed)
}

fn reject_unrecognised_options(options: &JsValue) -> Result<(), String> {
    if options.is_null() || options.is_undefined() {
        return Ok(());
    }
    for key in js_sys::Object::keys(&js_sys::Object::from(options.clone())).iter() {
        let Some(key) = key.as_string() else { continue };
        if !RECOGNISED_COMPILE_OPTIONS.contains(&key.as_str()) {
            return Err(format!(
                "Unrecognised compiler option {key}\nhttps://svelte.dev/e/options_unrecognised"
            ));
        }
    }
    Ok(())
}

/// Read `options[key]`, evaluating it once with `{ filename }` if it is a
/// function (Svelte's `parametric()` normalization); otherwise return the raw
/// value.
fn resolve_maybe_fn(options: &JsValue, key: &str, filename: &str) -> JsValue {
    let val = get_prop(options, key);
    let Some(func) = val.dyn_ref::<js_sys::Function>() else {
        return val;
    };
    let meta = js_sys::Object::new();
    let _ = js_sys::Reflect::set(
        &meta,
        &JsValue::from_str("filename"),
        &JsValue::from_str(filename),
    );
    func.call1(&JsValue::NULL, &meta)
        .unwrap_or(JsValue::UNDEFINED)
}

/// Reproduce the compiler's default (no-`cssHash`) scope hash so a `cssHash`
/// callback that returns a non-string can fall back to it: the rootDir-relative
/// filename when known, else the CSS content.
fn default_css_hash(input: &CssHashInput, root_dir: Option<&str>) -> String {
    if input.filename == "(unknown)" {
        return generate_css_hash(&input.css);
    }
    let mut fname = input.filename.replace('\\', "/");
    if let Some(rd) = root_dir {
        let rd = rd.replace('\\', "/");
        if let Some(rest) = fname.strip_prefix(&rd) {
            fname = rest.trim_start_matches('/').to_string();
        }
    }
    generate_css_hash(&fname)
}

fn build_warning_filter(func: js_sys::Function, slot: ErrorSlot) -> WarningFilterFn {
    Arc::new(move |warning: &Warning| -> bool {
        let obj = warning_to_js(warning);
        match func.call1(&JsValue::NULL, &obj) {
            Ok(v) => v.as_bool().unwrap_or(true),
            // A throwing filter aborts compilation (matching upstream Svelte and
            // the NAPI shim), surfaced via the shared error slot; the retained
            // warning here is discarded once the caller sees the failure.
            Err(e) => {
                slot.lock()
                    .unwrap()
                    .get_or_insert_with(|| js_error_message(&e));
                true
            }
        }
    })
}

/// Extract a JS error's `.message`, falling back to its string form.
fn js_error_message(e: &JsValue) -> String {
    e.as_string()
        .or_else(|| {
            js_sys::Reflect::get(e, &JsValue::from_str("message"))
                .ok()
                .and_then(|m| m.as_string())
        })
        .unwrap_or_else(|| "callback threw".to_string())
}

/// Bridge a user `cssHash({ hash, css, name, filename }) => string` into a
/// `CssHashFn`. A callback that throws is recorded in `error_slot` (surfaced as
/// a compile failure, matching upstream) and falls back to the default hash; a
/// non-string return also falls back — the bridge never panics.
fn build_css_hash(func: js_sys::Function, root_dir: Option<String>, slot: ErrorSlot) -> CssHashFn {
    Arc::new(move |input: &CssHashInput| -> String {
        let arg = js_sys::Object::new();
        // The callback's `hash` arg is the shared `CssHashInput::hash` — Svelte's
        // raw digest (no `svelte-` prefix) — so a custom scope class matches
        // upstream. The closure is dropped at the end of this synchronous call —
        // no leak, no `.forget()`.
        let hash_fn = input.hash.clone();
        let closure =
            Closure::wrap(Box::new(move |s: String| -> String { hash_fn(&s) })
                as Box<dyn Fn(String) -> String>);
        let _ = js_sys::Reflect::set(&arg, &JsValue::from_str("hash"), closure.as_ref());
        let _ = js_sys::Reflect::set(
            &arg,
            &JsValue::from_str("css"),
            &JsValue::from_str(&input.css),
        );
        let _ = js_sys::Reflect::set(
            &arg,
            &JsValue::from_str("name"),
            &JsValue::from_str(&input.name),
        );
        let _ = js_sys::Reflect::set(
            &arg,
            &JsValue::from_str("filename"),
            &JsValue::from_str(&input.filename),
        );
        match func.call1(&JsValue::NULL, &arg) {
            Ok(v) => v
                .as_string()
                .unwrap_or_else(|| default_css_hash(input, root_dir.as_deref())),
            Err(e) => {
                slot.lock()
                    .unwrap()
                    .get_or_insert_with(|| js_error_message(&e));
                default_css_hash(input, root_dir.as_deref())
            }
        }
    })
}

/// Build `CompileOptions` from a JS options object. `error_slot` collects a
/// throwing `cssHash` so the caller can surface it as a compile failure.
fn build_compile_options(
    options: &JsValue,
    error_slot: &ErrorSlot,
) -> Result<CompileOptions, String> {
    let mut opts = CompileOptions::default();
    if options.is_undefined() || options.is_null() {
        return Ok(opts);
    }

    reject_unrecognised_options(options)?;

    let filename = require_string(options, "filename")?;
    // Svelte defaults `filename` to '(unknown)' before invoking parametric fns.
    let meta_filename = filename.clone().unwrap_or_else(|| "(unknown)".to_string());
    opts.filename = filename;
    opts.root_dir = require_string(options, "rootDir")?;

    if let Some(value) = require_bool(options, "dev")? {
        opts.dev = value;
    }

    // `generate` is not parametric — functions are invalid values rather than
    // callbacks receiving `{ filename }`.
    let generate = get_prop(options, "generate");
    if present(&generate) {
        let (mode, renamed) = match generate.as_string().as_deref() {
            Some("client") => (GenerateMode::Client, false),
            Some("dom") => (GenerateMode::Client, true),
            Some("server") => (GenerateMode::Server, false),
            Some("ssr") => (GenerateMode::Server, true),
            _ if generate.as_bool() == Some(false) => (GenerateMode::None, false),
            _ => {
                return Err(invalid_option(
                    "generate must be \"client\", \"server\" or false",
                ));
            }
        };
        opts.generate = mode;
        if renamed {
            static WARNED: AtomicBool = AtomicBool::new(false);
            opts.legacy_options.generate_dom_ssr = warn_once(&WARNED);
        }
    }

    let warning_filter = get_prop(options, "warningFilter");
    if present(&warning_filter) && warning_filter.dyn_ref::<js_sys::Function>().is_none() {
        return Err(invalid_option(
            "warningFilter should be a function, if specified",
        ));
    }

    let experimental = get_prop(options, "experimental");
    if present(&experimental) {
        if !experimental.is_object() || js_sys::Array::is_array(&experimental) {
            return Err(invalid_option("experimental should be an object"));
        }
        for key in js_sys::Object::keys(&js_sys::Object::from(experimental.clone())).iter() {
            if key.as_string().as_deref() != Some("async") {
                return Err(format!(
                    "Unrecognised compiler option experimental.{}\nhttps://svelte.dev/e/options_unrecognised",
                    key.as_string().unwrap_or_default()
                ));
            }
        }
        let value = get_prop(&experimental, "async");
        if present(&value) {
            opts.experimental = ExperimentalOptions {
                r#async: value.as_bool().ok_or_else(|| {
                    invalid_option("experimental.async should be true or false, if specified")
                })?,
            };
        }
    }

    if let Some(value) = require_bool(options, "accessors")? {
        opts.accessors = value;
        static WARNED: AtomicBool = AtomicBool::new(false);
        opts.legacy_options.accessors = warn_once(&WARNED);
    }

    let css = resolve_maybe_fn(options, "css", &meta_filename);
    if present(&css) {
        opts.css = match css.as_string().as_deref() {
            Some("external") => CssMode::External,
            Some("injected") => CssMode::Injected,
            Some("none") => {
                return Err(invalid_option(
                    "css: \"none\" is no longer a valid option. If this was crucial for you, please open an issue on GitHub with your use case.",
                ));
            }
            _ if css.as_bool().is_some() => {
                return Err(invalid_option(
                    "The boolean options have been removed from the css option. Use \"external\" instead of false and \"injected\" instead of true",
                ));
            }
            _ => {
                return Err(invalid_option(
                    "css should be either \"external\" (default, recommended) or \"injected\"",
                ));
            }
        };
    }

    let css_hash = get_prop(options, "cssHash");
    if present(&css_hash) && css_hash.dyn_ref::<js_sys::Function>().is_none() {
        return Err(invalid_option("cssHash should be a function, if specified"));
    }
    opts.css_output_filename = require_string(options, "cssOutputFilename")?;

    let custom_element = resolve_maybe_fn(options, "customElement", &meta_filename);
    if present(&custom_element) {
        opts.custom_element = custom_element
            .as_bool()
            .ok_or_else(|| invalid_option("customElement should be true or false"))?;
    }

    if let Some(value) = require_bool(options, "discloseVersion")? {
        opts.disclose_version = value;
    }
    if let Some(value) = require_bool(options, "immutable")? {
        opts.immutable = value;
        static WARNED: AtomicBool = AtomicBool::new(false);
        opts.legacy_options.immutable = warn_once(&WARNED);
    }

    if present(&get_prop(options, "legacy")) {
        return Err("Invalid compiler option: The legacy option has been removed. If you are using this because of legacy.componentApi, use compatibility.componentApi instead\nhttps://svelte.dev/e/options_removed".to_string());
    }

    let compatibility = get_prop(options, "compatibility");
    if present(&compatibility) {
        if !compatibility.is_object() || js_sys::Array::is_array(&compatibility) {
            return Err(invalid_option("compatibility should be an object"));
        }
        for key in js_sys::Object::keys(&js_sys::Object::from(compatibility.clone())).iter() {
            if key.as_string().as_deref() != Some("componentApi") {
                return Err(format!(
                    "Unrecognised compiler option compatibility.{}\nhttps://svelte.dev/e/options_unrecognised",
                    key.as_string().unwrap_or_default()
                ));
            }
        }
        let value = get_prop(&compatibility, "componentApi");
        if present(&value) {
            opts.compatibility.component_api = match value.as_f64() {
                Some(4.0) => ComponentApi::V4,
                Some(5.0) => ComponentApi::V5,
                _ => {
                    return Err(invalid_option(
                        "compatibility.componentApi should be either \"4\" or \"5\"",
                    ));
                }
            };
        }
    }

    if present(&get_prop(options, "loopGuardTimeout")) {
        static WARNED: AtomicBool = AtomicBool::new(false);
        opts.legacy_options.loop_guard_timeout = warn_once(&WARNED);
    }
    opts.name = require_string(options, "name")?;

    let namespace = get_prop(options, "namespace");
    if present(&namespace) {
        opts.namespace = match namespace.as_string().as_deref() {
            Some("html") => Namespace::Html,
            Some("svg") => Namespace::Svg,
            Some("mathml") => Namespace::Mathml,
            _ => {
                return Err(invalid_option(
                    "namespace should be one of \"html\", \"mathml\" or \"svg\"",
                ));
            }
        };
    }
    if let Some(value) = require_bool(options, "modernAst")? {
        opts.modern_ast = value;
    }
    opts.output_filename = require_string(options, "outputFilename")?;
    if let Some(value) = require_bool(options, "preserveComments")? {
        opts.preserve_comments = value;
    }
    let fragments = get_prop(options, "fragments");
    if present(&fragments) {
        opts.fragments = match fragments.as_string().as_deref() {
            Some("html") => FragmentMode::Html,
            Some("tree") => FragmentMode::Tree,
            _ => {
                return Err(invalid_option(
                    "fragments should be either \"html\" or \"tree\"",
                ));
            }
        };
    }
    if let Some(value) = require_bool(options, "preserveWhitespace")? {
        opts.preserve_whitespace = value;
    }

    let runes = resolve_maybe_fn(options, "runes", &meta_filename);
    if present(&runes) {
        opts.runes = match runes.as_bool() {
            Some(value) => Some(value),
            None if runes.as_f64().is_some_and(|n| n != 0.0 && !n.is_nan()) => Some(true),
            None if runes.as_string().is_some_and(|s| !s.is_empty()) => Some(true),
            None if runes.is_object() => Some(true),
            None => None,
        };
    }
    if let Some(value) = require_bool(options, "hmr")? {
        opts.hmr = value;
    }

    let sourcemap = get_prop(options, "sourcemap");
    if present(&sourcemap) {
        opts.sourcemap = sourcemap.as_string().or_else(|| {
            js_sys::JSON::stringify(&sourcemap)
                .ok()
                .and_then(|value| value.as_string())
        });
    }
    if present(&get_prop(options, "enableSourcemap")) {
        static WARNED: AtomicBool = AtomicBool::new(false);
        opts.legacy_options.enable_sourcemap = warn_once(&WARNED);
    }
    if present(&get_prop(options, "hydratable")) {
        static WARNED: AtomicBool = AtomicBool::new(false);
        opts.legacy_options.hydratable = warn_once(&WARNED);
    }

    for (key, message) in [
        (
            "format",
            "The format option has been removed in Svelte 4, the compiler only outputs ESM now. Remove \"format\" from your compiler options. If you did not set this yourself, bump the version of your bundler plugin (vite-plugin-svelte/rollup-plugin-svelte/svelte-loader)",
        ),
        (
            "tag",
            "The tag option has been removed in Svelte 5. Use `<svelte:options customElement=\"tag-name\" />` inside the component instead. If that does not solve your use case, please open an issue on GitHub with details.",
        ),
        (
            "sveltePath",
            "The sveltePath option has been removed in Svelte 5. If this option was crucial for you, please open an issue on GitHub with your use case.",
        ),
        (
            "errorMode",
            "The errorMode option has been removed. If you are using this through svelte-preprocess with TypeScript, use the https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax setting instead",
        ),
        (
            "varsReport",
            "The vars option has been removed. If you are using this through svelte-preprocess with TypeScript, use the https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax setting instead",
        ),
    ] {
        if present(&get_prop(options, key)) {
            return Err(format!(
                "Invalid compiler option: {message}\nhttps://svelte.dev/e/options_removed"
            ));
        }
    }

    if let Some(func) = get_prop(options, "warningFilter").dyn_ref::<js_sys::Function>() {
        opts.warning_filter = Some(build_warning_filter(func.clone(), Arc::clone(error_slot)));
    }

    // A constant `cssHashOverride` wins; otherwise bridge a dynamic `cssHash`.
    if let Some(hash) = get_prop(options, "cssHashOverride").as_string() {
        opts.css_hash = Some(Arc::new(move |_: &CssHashInput| hash.clone()));
    } else if let Some(func) = get_prop(options, "cssHash").dyn_ref::<js_sys::Function>() {
        opts.css_hash = Some(build_css_hash(
            func.clone(),
            opts.root_dir.clone(),
            Arc::clone(error_slot),
        ));
    }

    Ok(opts)
}

fn warning_to_js(warning: &Warning) -> JsValue {
    js_sys::JSON::parse(&warning_to_value(warning).to_string()).unwrap_or(JsValue::UNDEFINED)
}

fn warning_to_value(w: &Warning) -> serde_json::Value {
    let mut map = serde_json::Map::new();
    map.insert(
        "code".to_string(),
        serde_json::Value::String(w.code.clone()),
    );
    map.insert(
        "message".to_string(),
        serde_json::Value::String(w.message.clone()),
    );
    if let Some(ref filename) = w.filename {
        map.insert(
            "filename".to_string(),
            serde_json::Value::String(filename.clone()),
        );
    }
    let pos = |p: &crate::compiler::Position| serde_json::json!({ "line": p.line, "column": p.column, "character": p.character });
    if let Some(ref start) = w.start {
        map.insert("start".to_string(), pos(start));
    }
    if let Some(ref end) = w.end {
        map.insert("end".to_string(), pos(end));
    }
    if let (Some(start), Some(end)) = (&w.start, &w.end) {
        map.insert(
            "position".to_string(),
            serde_json::json!([start.character, end.character]),
        );
    }
    serde_json::Value::Object(map)
}

fn compile_result_to_json(result: CompileResult) -> String {
    let parse_map = |m: Option<&str>| {
        m.and_then(|s| serde_json::from_str::<serde_json::Value>(s).ok())
            .unwrap_or(serde_json::Value::Null)
    };
    let css = result
        .css
        .map(|c| {
            serde_json::json!({
                "code": c.code,
                "map": parse_map(c.map.as_deref()),
                "hasGlobal": c.has_global,
            })
        })
        .unwrap_or(serde_json::Value::Null);
    let warnings: Vec<serde_json::Value> = result.warnings.iter().map(warning_to_value).collect();
    serde_json::json!({
        "js": { "code": result.js.code, "map": parse_map(result.js.map.as_deref()) },
        "css": css,
        "warnings": warnings,
        "metadata": { "runes": result.metadata.runes },
    })
    .to_string()
}

/// Compile a Svelte component with the full compile-options object.
///
/// Supports the function-form compile options (issue #1680): the `parametric`
/// function forms of `customElement`/`css`/`runes`, a `warningFilter` callback,
/// a constant `cssHashOverride`, and a dynamic `cssHash` callback. Returns the
/// compile result as a JSON string (`{ js, css, warnings, metadata }`);
/// callbacks are input-only. Throws on a parse failure, an invalid option, or a
/// `cssHash` callback that throws.
#[wasm_bindgen(js_name = compile)]
pub fn compile_svelte(source: &str, options: JsValue) -> Result<String, JsValue> {
    let error_slot: ErrorSlot = Arc::new(Mutex::new(None));
    let opts = build_compile_options(&options, &error_slot).map_err(option_error_to_js)?;
    let result = compile(source, opts);
    if let Some(msg) = error_slot.lock().unwrap().take() {
        return Err(JsValue::from_str(&msg));
    }
    match result {
        Ok(r) => Ok(compile_result_to_json(r)),
        Err(e) => Err(JsValue::from_str(&format!("{e:?}"))),
    }
}
