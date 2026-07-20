//! WebAssembly bindings for the Svelte compiler.
//!
//! This module provides JavaScript-accessible functions for compiling
//! Svelte components in the browser.

use wasm_bindgen::prelude::*;

use crate::compiler::phases::phase1_parse::{ParseOptions, parse};
use crate::compiler::{CompileOptions, CssMode, GenerateMode, compile};
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
