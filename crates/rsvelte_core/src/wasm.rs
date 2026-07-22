//! WebAssembly bindings for the Svelte compiler.
//!
//! This module provides JavaScript-accessible functions for compiling
//! Svelte components in the browser.

use std::sync::{Arc, Mutex};

use wasm_bindgen::prelude::*;

use crate::compiler::phases::phase1_parse::{ParseOptions, parse};
use crate::compiler::phases::phase3_transform::css::{generate_css_hash, generate_raw_hash};
use crate::compiler::{
    CompileOptions, CompileResult, CssHashFn, CssHashInput, CssMode, GenerateMode, Namespace,
    Warning, WarningFilterFn, compile,
};
use crate::svelte2tsx::{
    Svelte2TsxMode, Svelte2TsxNamespace, Svelte2TsxOptions, SvelteVersion,
    svelte2tsx as rust_svelte2tsx,
};

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
    let options = ParseOptions::default();

    match parse(source, options) {
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
    let mut opts = Svelte2TsxOptions::default();
    let Ok(value) = serde_json::from_str::<serde_json::Value>(options_json) else {
        return opts;
    };
    let Some(obj) = value.as_object() else {
        return opts;
    };
    if let Some(v) = obj.get("filename").and_then(|v| v.as_str()) {
        opts.filename = v.to_string();
    }
    if let Some(v) = obj.get("isTsFile").and_then(|v| v.as_bool()) {
        opts.is_ts_file = v;
    }
    if let Some(v) = obj.get("mode").and_then(|v| v.as_str()) {
        opts.mode = match v {
            "dts" => Svelte2TsxMode::Dts,
            _ => Svelte2TsxMode::Ts,
        };
    }
    if let Some(v) = obj.get("accessors").and_then(|v| v.as_bool()) {
        opts.accessors = v;
    }
    if let Some(v) = obj.get("namespace").and_then(|v| v.as_str()) {
        opts.namespace = match v {
            "svg" => Svelte2TsxNamespace::Svg,
            "mathml" => Svelte2TsxNamespace::Mathml,
            _ => Svelte2TsxNamespace::Html,
        };
    }
    if let Some(v) = obj.get("version").and_then(|v| v.as_str()) {
        opts.version = if v.starts_with('5') {
            SvelteVersion::V5
        } else {
            SvelteVersion::V4
        };
    }
    opts
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

fn build_warning_filter(func: js_sys::Function) -> WarningFilterFn {
    Arc::new(move |warning: &Warning| -> bool {
        let obj = warning_to_js(warning);
        // A throwing filter keeps the warning rather than dropping it silently.
        match func.call1(&JsValue::NULL, &obj) {
            Ok(v) => v.as_bool().unwrap_or(true),
            Err(_) => true,
        }
    })
}

/// Bridge a user `cssHash({ hash, css, name, filename }) => string` into a
/// `CssHashFn`. A callback that throws is recorded in `error_slot` (surfaced as
/// a compile failure, matching upstream) and falls back to the default hash; a
/// non-string return also falls back — the bridge never panics.
fn build_css_hash(func: js_sys::Function, root_dir: Option<String>, slot: ErrorSlot) -> CssHashFn {
    Arc::new(move |input: &CssHashInput| -> String {
        let arg = js_sys::Object::new();
        // The callback's `hash` arg is Svelte's raw digest (no `svelte-` prefix,
        // unlike `CssHashInput::hash`) so a custom scope class matches upstream.
        // The closure is dropped at the end of this synchronous call — no leak,
        // no `.forget()`.
        let closure = Closure::wrap(Box::new(|s: String| -> String { generate_raw_hash(&s) })
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
                let msg = e
                    .as_string()
                    .or_else(|| {
                        js_sys::Reflect::get(&e, &JsValue::from_str("message"))
                            .ok()
                            .and_then(|m| m.as_string())
                    })
                    .unwrap_or_else(|| "cssHash callback threw".to_string());
                slot.lock().unwrap().get_or_insert(msg);
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

    let filename = get_prop(options, "filename").as_string();
    // Svelte defaults `filename` to '(unknown)' before invoking parametric fns.
    let meta_filename = filename.clone().unwrap_or_else(|| "(unknown)".to_string());
    opts.filename = filename;
    opts.root_dir = get_prop(options, "rootDir").as_string();
    if let Some(n) = get_prop(options, "name").as_string() {
        opts.name = Some(n);
    }

    let generate = resolve_maybe_fn(options, "generate", &meta_filename);
    if let Some(s) = generate.as_string() {
        opts.generate = match s.as_str() {
            "client" | "dom" => GenerateMode::Client,
            "server" | "ssr" => GenerateMode::Server,
            "false" => GenerateMode::None,
            _ => return Err("generate must be \"client\", \"server\" or false".to_string()),
        };
    } else if generate.as_bool() == Some(false) {
        opts.generate = GenerateMode::None;
    }

    let css = resolve_maybe_fn(options, "css", &meta_filename);
    if let Some(s) = css.as_string() {
        opts.css = match s.as_str() {
            "external" => CssMode::External,
            "injected" => CssMode::Injected,
            _ => {
                return Err(
                    "css should be either \"external\" (default, recommended) or \"injected\""
                        .to_string(),
                );
            }
        };
    }

    if let Some(b) = resolve_maybe_fn(options, "customElement", &meta_filename).as_bool() {
        opts.custom_element = b;
    }
    // `runes` is tri-state: a boolean forces the mode, anything else auto-detects.
    if let Some(b) = resolve_maybe_fn(options, "runes", &meta_filename).as_bool() {
        opts.runes = Some(b);
    }

    if let Some(b) = get_prop(options, "dev").as_bool() {
        opts.dev = b;
    }
    if let Some(b) = get_prop(options, "accessors").as_bool() {
        opts.accessors = b;
    }
    if let Some(b) = get_prop(options, "immutable").as_bool() {
        opts.immutable = b;
    }
    if let Some(b) = get_prop(options, "preserveComments").as_bool() {
        opts.preserve_comments = b;
    }
    if let Some(b) = get_prop(options, "preserveWhitespace").as_bool() {
        opts.preserve_whitespace = b;
    }
    if let Some(b) = get_prop(options, "discloseVersion").as_bool() {
        opts.disclose_version = b;
    }
    if let Some(b) = get_prop(options, "hmr").as_bool() {
        opts.hmr = b;
    }
    if let Some(s) = get_prop(options, "namespace").as_string() {
        opts.namespace = match s.as_str() {
            "svg" => Namespace::Svg,
            "mathml" => Namespace::Mathml,
            _ => Namespace::Html,
        };
    }

    if let Some(func) = get_prop(options, "warningFilter").dyn_ref::<js_sys::Function>() {
        opts.warning_filter = Some(build_warning_filter(func.clone()));
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
    let opts = build_compile_options(&options, &error_slot).map_err(|e| JsValue::from_str(&e))?;
    let result = compile(source, opts);
    if let Some(msg) = error_slot.lock().unwrap().take() {
        return Err(JsValue::from_str(&msg));
    }
    match result {
        Ok(r) => Ok(compile_result_to_json(r)),
        Err(e) => Err(JsValue::from_str(&format!("{e:?}"))),
    }
}
