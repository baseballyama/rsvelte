//! N-API bindings for the Svelte compiler.
//!
//! This module provides Node.js native addon bindings via napi-rs,
//! allowing the Rust Svelte compiler to be used from JavaScript/TypeScript.

use napi_derive::napi;
use serde_json::Value;

use crate::compiler::{
    CompileOptions, CssMode, ExperimentalOptions, GenerateMode, ModuleCompileOptions, Namespace,
    compile as rust_compile, compile_module as rust_compile_module,
};

/// Compile a Svelte component.
///
/// Takes source code and an options object, returns a result object
/// matching the official `svelte/compiler` output shape.
#[napi(js_name = "compile")]
pub fn napi_compile(source: String, options: Value) -> napi::Result<Value> {
    let opts = parse_options(&options)?;

    match rust_compile(&source, opts) {
        Ok(result) => {
            let js_obj = serde_json::json!({
                "code": result.js.code,
                "map": result.js.map.as_deref().map(|m| serde_json::from_str::<Value>(m).unwrap_or(Value::Null)).unwrap_or(Value::Null),
            });

            let css_obj = result.css.map(|c| {
                serde_json::json!({
                    "code": c.code,
                    "map": c.map.as_deref().map(|m| serde_json::from_str::<Value>(m).unwrap_or(Value::Null)).unwrap_or(Value::Null),
                    "hasGlobal": c.has_global,
                })
            });

            let warnings: Vec<Value> = result
                .warnings
                .iter()
                .map(|w| {
                    // Build warning object with keys in the same order as official Svelte:
                    // code, message, filename, start, end, position, frame
                    let mut map = serde_json::Map::new();
                    map.insert("code".to_string(), Value::String(w.code.clone()));
                    map.insert("message".to_string(), Value::String(w.message.clone()));
                    if let Some(ref filename) = w.filename {
                        map.insert("filename".to_string(), Value::String(filename.clone()));
                    }
                    if let Some(ref start) = w.start {
                        let mut s = serde_json::Map::new();
                        s.insert("line".to_string(), serde_json::json!(start.line));
                        s.insert("column".to_string(), serde_json::json!(start.column));
                        s.insert("character".to_string(), serde_json::json!(start.character));
                        map.insert("start".to_string(), Value::Object(s));
                    }
                    if let Some(ref end) = w.end {
                        let mut e = serde_json::Map::new();
                        e.insert("line".to_string(), serde_json::json!(end.line));
                        e.insert("column".to_string(), serde_json::json!(end.column));
                        e.insert("character".to_string(), serde_json::json!(end.character));
                        map.insert("end".to_string(), Value::Object(e));
                    }
                    if let (Some(start), Some(end)) = (&w.start, &w.end) {
                        map.insert(
                            "position".to_string(),
                            serde_json::json!([start.character, end.character]),
                        );
                    }
                    if let Some(ref frame) = w.frame {
                        map.insert("frame".to_string(), Value::String(frame.clone()));
                    }
                    Value::Object(map)
                })
                .collect();

            let output = serde_json::json!({
                "js": js_obj,
                "css": css_obj,
                "warnings": warnings,
                "metadata": {
                    "runes": result.metadata.runes,
                },
                "ast": Value::Null,
            });

            Ok(output)
        }
        Err(e) => Err(napi::Error::from_reason(format!("{e:?}"))),
    }
}

/// Parse JS options object into CompileOptions.
fn parse_options(options: &Value) -> napi::Result<CompileOptions> {
    let obj = options.as_object();

    let mut opts = CompileOptions::default();

    if let Some(obj) = obj {
        // dev
        if let Some(v) = obj.get("dev").and_then(|v| v.as_bool()) {
            opts.dev = v;
        }

        // generate
        if let Some(v) = obj.get("generate").and_then(|v| v.as_str()) {
            opts.generate = match v {
                "server" | "ssr" => GenerateMode::Server,
                "false" => GenerateMode::None,
                _ => GenerateMode::Client,
            };
        }

        // filename
        if let Some(v) = obj.get("filename").and_then(|v| v.as_str()) {
            opts.filename = Some(v.to_string());
        }

        // rootDir - defaults to process.cwd() equivalent, matching the official Svelte compiler
        if let Some(v) = obj.get("rootDir").and_then(|v| v.as_str()) {
            opts.root_dir = Some(v.to_string());
        } else if let Ok(cwd) = std::env::current_dir() {
            opts.root_dir = Some(cwd.to_string_lossy().to_string());
        }

        // name
        if let Some(v) = obj.get("name").and_then(|v| v.as_str()) {
            opts.name = Some(v.to_string());
        }

        // customElement
        if let Some(v) = obj.get("customElement").and_then(|v| v.as_bool()) {
            opts.custom_element = v;
        }

        // accessors
        if let Some(v) = obj.get("accessors").and_then(|v| v.as_bool()) {
            opts.accessors = v;
        }

        // namespace
        if let Some(v) = obj.get("namespace").and_then(|v| v.as_str()) {
            opts.namespace = match v {
                "svg" => Namespace::Svg,
                "mathml" => Namespace::Mathml,
                _ => Namespace::Html,
            };
        }

        // immutable
        if let Some(v) = obj.get("immutable").and_then(|v| v.as_bool()) {
            opts.immutable = v;
        }

        // css
        if let Some(v) = obj.get("css").and_then(|v| v.as_str()) {
            opts.css = match v {
                "injected" => CssMode::Injected,
                _ => CssMode::External,
            };
        }

        // preserveComments
        if let Some(v) = obj.get("preserveComments").and_then(|v| v.as_bool()) {
            opts.preserve_comments = v;
        }

        // preserveWhitespace
        if let Some(v) = obj.get("preserveWhitespace").and_then(|v| v.as_bool()) {
            opts.preserve_whitespace = v;
        }

        // runes
        if let Some(v) = obj.get("runes").and_then(|v| v.as_bool()) {
            opts.runes = Some(v);
        }

        // discloseVersion
        if let Some(v) = obj.get("discloseVersion").and_then(|v| v.as_bool()) {
            opts.disclose_version = v;
        }

        // sourcemap - can be a JSON string or an object
        if let Some(v) = obj.get("sourcemap") {
            if let Some(s) = v.as_str() {
                opts.sourcemap = Some(s.to_string());
            } else if v.is_object() || v.is_array() {
                // Preprocessor passes source map as an object; serialize it
                opts.sourcemap = Some(serde_json::to_string(v).unwrap_or_default());
            }
        }

        // outputFilename
        if let Some(v) = obj.get("outputFilename").and_then(|v| v.as_str()) {
            opts.output_filename = Some(v.to_string());
        }

        // cssOutputFilename
        if let Some(v) = obj.get("cssOutputFilename").and_then(|v| v.as_str()) {
            opts.css_output_filename = Some(v.to_string());
        }

        // hmr
        if let Some(v) = obj.get("hmr").and_then(|v| v.as_bool()) {
            opts.hmr = v;
        }

        // modernAst
        if let Some(v) = obj.get("modernAst").and_then(|v| v.as_bool()) {
            opts.modern_ast = v;
        }

        // experimental
        if let Some(exp) = obj.get("experimental").and_then(|v| v.as_object())
            && let Some(v) = exp.get("async").and_then(|v| v.as_bool())
        {
            opts.experimental = ExperimentalOptions { r#async: v };
        }

        // compatibility
        if let Some(compat) = obj.get("compatibility").and_then(|v| v.as_object())
            && let Some(v) = compat.get("componentApi").and_then(|v| v.as_u64())
        {
            opts.compatibility.component_api = if v == 4 {
                crate::compiler::ComponentApi::V4
            } else {
                crate::compiler::ComponentApi::V5
            };
        }

        // cssHash - JS function can't be called from Rust, but cssHashOverride
        // provides the pre-computed result from the test harness
        if let Some(v) = obj.get("cssHashOverride").and_then(|v| v.as_str()) {
            let hash_override = v.to_string();
            opts.css_hash = Some(std::sync::Arc::new(
                move |_: &crate::compiler::CssHashInput| hash_override.clone(),
            ));
        }

        // fragments
        if let Some(v) = obj.get("fragments").and_then(|v| v.as_str()) {
            opts.fragments = match v {
                "tree" => crate::compiler::FragmentMode::Tree,
                _ => crate::compiler::FragmentMode::Html,
            };
        }

        // warningFilter - skip (JS function, use default)
    }

    Ok(opts)
}

/// Compile a Svelte module (.svelte.js/.svelte.ts).
#[napi(js_name = "compileModule")]
pub fn napi_compile_module(source: String, options: Value) -> napi::Result<Value> {
    let obj = options.as_object();

    let mut opts = ModuleCompileOptions::default();

    if let Some(obj) = obj {
        if let Some(v) = obj.get("dev").and_then(|v| v.as_bool()) {
            opts.dev = v;
        }
        if let Some(v) = obj.get("generate").and_then(|v| v.as_str()) {
            opts.generate = match v {
                "server" | "ssr" => GenerateMode::Server,
                "false" => GenerateMode::None,
                _ => GenerateMode::Client,
            };
        }
        if let Some(v) = obj.get("filename").and_then(|v| v.as_str()) {
            opts.filename = Some(v.to_string());
        }
        if let Some(v) = obj.get("rootDir").and_then(|v| v.as_str()) {
            opts.root_dir = Some(v.to_string());
        }
        if let Some(exp) = obj.get("experimental").and_then(|v| v.as_object())
            && let Some(v) = exp.get("async").and_then(|v| v.as_bool())
        {
            opts.experimental = ExperimentalOptions { r#async: v };
        }
    }

    match rust_compile_module(&source, opts) {
        Ok(result) => {
            let js_obj = serde_json::json!({
                "code": result.js.code,
                "map": result.js.map.as_deref()
                    .map(|m| serde_json::from_str::<Value>(m).unwrap_or(Value::Null))
                    .unwrap_or(Value::Null),
            });

            let output = serde_json::json!({
                "js": js_obj,
                "css": Value::Null,
                "warnings": [],
                "metadata": {
                    "runes": true,
                },
                "ast": Value::Null,
            });

            Ok(output)
        }
        Err(e) => Err(napi::Error::from_reason(format!("{e:?}"))),
    }
}
