//! N-API bindings for the Svelte compiler.
//!
//! This module provides Node.js native addon bindings via napi-rs,
//! allowing the Rust Svelte compiler to be used from JavaScript/TypeScript.

// Jemalloc is installed here (rather than at the lib root) so that the
// rlib doesn't carry a `#[global_allocator]` symbol — which collides with
// the cdylib's copy on Linux + fat LTO when a downstream bin links against
// both crate-type outputs (cargo issue rust-lang/cargo#6313). This module
// is only compiled when the `napi` feature is on, so the rlib stays clean
// for normal builds, and the cdylib gets jemalloc when it ships as the
// NAPI prebuilt.
#[cfg(all(
    feature = "jemalloc",
    not(target_arch = "wasm32"),
    not(target_os = "windows")
))]
#[global_allocator]
static GLOBAL: tikv_jemallocator::Jemalloc = tikv_jemallocator::Jemalloc;

use napi::Env;
use napi_derive::napi;
use serde_json::Value;

use crate::compiler::{
    CompileOptions, CssMode, ExperimentalOptions, GenerateMode, ModuleCompileOptions, Namespace,
    compile as rust_compile, compile_module as rust_compile_module,
};
use crate::svelte2tsx::{
    Svelte2TsxMode, Svelte2TsxNamespace, Svelte2TsxOptions, SvelteVersion,
    svelte2tsx as rust_svelte2tsx,
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

/// Convert a Svelte component to TypeScript/TSX for type checking.
///
/// This is the NAPI binding for `svelte2tsx`, used by the Svelte language server
/// and other tooling to get TypeScript representations of Svelte components.
#[napi(js_name = "svelte2tsx")]
pub fn napi_svelte2tsx(source: String, options: Value) -> napi::Result<Value> {
    let opts = parse_svelte2tsx_options(&options);

    match rust_svelte2tsx(&source, opts) {
        Ok(result) => {
            let props: Vec<Value> = result
                .exported_names
                .get_prop_names()
                .iter()
                .map(|n: &&str| Value::String(n.to_string()))
                .collect();

            let all: Vec<Value> = result
                .exported_names
                .get_all_names()
                .iter()
                .map(|n: &&str| Value::String(n.to_string()))
                .collect();

            let output = serde_json::json!({
                "code": result.code,
                "map": Value::Null,
                "exportedNames": {
                    "props": props,
                    "all": all,
                },
                "events": {},
            });

            Ok(output)
        }
        Err(e) => Err(napi::Error::from_reason(format!("{e}"))),
    }
}

/// Parse JS options object into Svelte2TsxOptions.
fn parse_svelte2tsx_options(options: &Value) -> Svelte2TsxOptions {
    let mut opts = Svelte2TsxOptions::default();

    let Some(obj) = options.as_object() else {
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

// =============================================================================
// vite-plugin-svelte (Wave 3) NAPI surface
// =============================================================================

use crate::vps::{ResolveOptions, hmr_diff as rust_hmr_diff, resolve_id as rust_resolve_id};

/// Diff two `.svelte` source versions. Returns `{ change, instanceChanged,
/// moduleChanged }` so the JS shim can decide between Vite's hot-update
/// patch and a full reload. Mirrors the JS reference's
/// `vite-plugin-svelte/src/plugins/hot-update.js`.
#[napi(js_name = "hmrDiff")]
pub fn napi_hmr_diff(prev: String, curr: String) -> napi::Result<Value> {
    let diff = rust_hmr_diff(&prev, &curr);
    let kind = match diff.change {
        crate::vps::HmrChange::HotUpdate => "hot-update",
        crate::vps::HmrChange::FullReload => "full-reload",
        crate::vps::HmrChange::Unchanged => "unchanged",
    };
    Ok(serde_json::json!({
        "change": kind,
        "instanceChanged": diff.instance_changed,
        "moduleChanged": diff.module_changed,
    }))
}

/// Resolve a relative module specifier from an importer's directory.
/// Returns `null` for bare specifiers — the JS shim falls back to
/// Vite's main resolver in that case.
#[napi(js_name = "resolveId")]
pub fn napi_resolve_id(importer: Option<String>, specifier: String) -> napi::Result<Value> {
    let importer_path = importer.as_ref().map(std::path::Path::new);
    let res = rust_resolve_id(ResolveOptions {
        importer: importer_path,
        specifier: &specifier,
    });
    match res {
        Some(r) => Ok(serde_json::json!({ "resolved": r.resolved })),
        None => Ok(Value::Null),
    }
}

/// Run rsvelte's preprocessor pipeline, bridging JS preprocessor
/// callbacks through `napi::threadsafe_function::ThreadsafeFunction`.
///
/// `preprocessors` is an array of `{ name?, markup?, script?, style? }`
/// JS objects matching `svelte/preprocess`'s `PreprocessorGroup`. Each
/// callback may be sync or `async` and may return either a
/// `{ code, map?, dependencies?, attributes? }` object or
/// `undefined`/`null` to skip the file. Callbacks are invoked on the
/// JS thread via N-API's ThreadsafeFunction machinery — the heavy
/// lifting (tag extraction, source-map chaining) stays in Rust.
///
/// Shape mirrors `svelte/preprocess`: `{ code, map, dependencies }`.
#[napi(js_name = "preprocess")]
pub fn napi_preprocess(
    env: Env,
    source: String,
    preprocessors: Vec<napi::bindgen_prelude::Object>,
    filename: Option<String>,
) -> napi::Result<napi::JsObject> {
    // Extract ThreadsafeFunctions synchronously so the JS-bound `Object`
    // values never cross the await boundary (they're not Send).
    let extracted = preprocess_bridge::extract_groups(preprocessors)?;
    let rust_groups = preprocess_bridge::build_groups(extracted);

    env.execute_tokio_future(
        async move {
            crate::compiler::preprocess::preprocess(source, rust_groups, filename)
                .await
                .map_err(|e| napi::Error::from_reason(format!("{e}")))
        },
        |_env, processed| Ok(preprocess_bridge::processed_to_json(processed)),
    )
}

mod preprocess_bridge {
    use crate::compiler::preprocess::types::{
        AttributeValue as RsAttrValue, MarkupPreprocessorFn, MarkupPreprocessorOptions,
        PreprocessError, PreprocessorFn, PreprocessorGroup, PreprocessorOptions,
        PreprocessorResult, Processed, SimpleDecodedMap, SourceMapInput,
    };
    use napi::bindgen_prelude::{Object, Promise};
    use napi::threadsafe_function::{ErrorStrategy, ThreadsafeFunction};
    use rustc_hash::FxHashMap;
    use serde_json::Value;

    pub(super) type Tsfn = ThreadsafeFunction<Value, ErrorStrategy::CalleeHandled>;

    pub(super) struct Extracted {
        pub name: Option<String>,
        pub markup: Option<Tsfn>,
        pub script: Option<Tsfn>,
        pub style: Option<Tsfn>,
    }

    pub(super) fn extract_groups(groups: Vec<Object>) -> napi::Result<Vec<Extracted>> {
        groups
            .into_iter()
            .map(|obj| {
                Ok(Extracted {
                    name: obj.get::<_, String>("name")?,
                    markup: obj.get::<_, Tsfn>("markup")?,
                    script: obj.get::<_, Tsfn>("script")?,
                    style: obj.get::<_, Tsfn>("style")?,
                })
            })
            .collect()
    }

    pub(super) fn build_groups(extracted: Vec<Extracted>) -> Vec<PreprocessorGroup> {
        extracted
            .into_iter()
            .map(|g| PreprocessorGroup {
                name: g.name,
                markup: g.markup.map(make_markup_bridge),
                script: g.script.map(|t| make_tag_bridge(t, "script")),
                style: g.style.map(|t| make_tag_bridge(t, "style")),
            })
            .collect()
    }

    fn make_markup_bridge(tsfn: Tsfn) -> MarkupPreprocessorFn {
        Box::new(
            move |opts: MarkupPreprocessorOptions| -> PreprocessorResult {
                let tsfn = tsfn.clone();
                Box::pin(async move {
                    let arg = serde_json::json!({
                        "content": opts.content,
                        "filename": opts.filename,
                    });
                    let ret_val = await_tsfn(&tsfn, arg).await?;
                    Ok(json_to_processed(ret_val))
                })
            },
        )
    }

    fn make_tag_bridge(tsfn: Tsfn, _kind: &'static str) -> PreprocessorFn {
        Box::new(move |opts: PreprocessorOptions| -> PreprocessorResult {
            let tsfn = tsfn.clone();
            Box::pin(async move {
                let arg = serde_json::json!({
                    "content": opts.content,
                    "attributes": attrs_to_json(&opts.attributes),
                    "markup": opts.markup,
                    "filename": opts.filename,
                });
                let ret_val = await_tsfn(&tsfn, arg).await?;
                Ok(json_to_processed(ret_val))
            })
        })
    }

    async fn await_tsfn(tsfn: &Tsfn, arg: Value) -> Result<Value, PreprocessError> {
        // Callbacks are expected to return a Promise (matching the JS
        // `(opts) => Promise<Processed | void>` contract). Sync callers
        // should `async (opts) => …` — `Promise.resolve(...)` is not
        // injected on the Rust side.
        let promise: Promise<Value> = tsfn
            .call_async(Ok(arg))
            .await
            .map_err(|e| PreprocessError::Other(format!("{e}")))?;
        promise
            .await
            .map_err(|e| PreprocessError::Other(format!("{e}")))
    }

    fn attrs_to_json(attrs: &FxHashMap<String, RsAttrValue>) -> Value {
        let mut map = serde_json::Map::new();
        for (k, v) in attrs {
            map.insert(
                k.clone(),
                match v {
                    RsAttrValue::Boolean(b) => Value::Bool(*b),
                    RsAttrValue::String(s) => Value::String(s.clone()),
                },
            );
        }
        Value::Object(map)
    }

    fn json_to_processed(val: Value) -> Option<Processed> {
        let obj = val.as_object()?;

        let code = obj.get("code").and_then(|v| v.as_str()).map(String::from)?;

        let map = obj.get("map").and_then(json_to_sourcemap_input);

        let dependencies = obj
            .get("dependencies")
            .and_then(|v| v.as_array())
            .map(|arr| {
                arr.iter()
                    .filter_map(|v| v.as_str().map(String::from))
                    .collect::<Vec<_>>()
            })
            .unwrap_or_default();

        let attributes = obj.get("attributes").and_then(json_to_attributes);

        Some(Processed {
            code,
            map,
            dependencies,
            attributes,
        })
    }

    fn json_to_sourcemap_input(val: &Value) -> Option<SourceMapInput> {
        match val {
            Value::Null => None,
            Value::String(s) => Some(SourceMapInput::Json(s.clone())),
            Value::Object(_) => {
                // Either a decoded map or an encoded one — serialize to JSON
                // so the existing chaining path (which expects either form)
                // handles both.
                let s = serde_json::to_string(val).ok()?;
                if let Ok(decoded) = serde_json::from_str::<SimpleDecodedMap>(&s) {
                    return Some(SourceMapInput::Decoded(decoded));
                }
                Some(SourceMapInput::Json(s))
            }
            _ => None,
        }
    }

    fn json_to_attributes(val: &Value) -> Option<FxHashMap<String, RsAttrValue>> {
        let obj = val.as_object()?;
        let mut out = FxHashMap::default();
        for (k, v) in obj {
            let av = match v {
                Value::Bool(b) => RsAttrValue::Boolean(*b),
                Value::String(s) => RsAttrValue::String(s.clone()),
                _ => continue,
            };
            out.insert(k.clone(), av);
        }
        Some(out)
    }

    pub(super) fn processed_to_json(p: Processed) -> Value {
        let map = match p.map {
            None => Value::Null,
            Some(SourceMapInput::Json(s)) => {
                serde_json::from_str::<Value>(&s).unwrap_or(Value::Null)
            }
            Some(SourceMapInput::Decoded(decoded)) => {
                serde_json::to_value(&decoded).unwrap_or(Value::Null)
            }
        };
        let deps: Vec<Value> = p.dependencies.into_iter().map(Value::String).collect();
        serde_json::json!({
            "code": p.code,
            "map": map,
            "dependencies": deps,
        })
    }
}
