//! N-API bindings for the Svelte compiler.
//!
//! This module provides Node.js native addon bindings via napi-rs,
//! allowing the Rust Svelte compiler to be used from JavaScript/TypeScript.

// napi 3 moved the legacy `JsBuffer` / `JsObject` / `Env::execute_tokio_future`
// / `Env::create_buffer_with_borrowed_data` surface behind the `compat-mode`
// feature and emits deprecation warnings against the new `Buffer` / `Object` /
// `Env::spawn_future` / `BufferSlice::from_external` replacements. Suppress
// those here — the surface is fully covered by `compat-mode` and migrating to
// the new API surface is out of scope for the dep bump.
#![allow(deprecated)]

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

use napi::bindgen_prelude::Buffer;
use napi::{Env, JsBuffer};
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
/// Serialise compiler warnings into the JSON shape the official
/// `svelte/compiler` output uses (`code`, `message`, `filename`, `start`, `end`,
/// `position`, `frame`).
fn warnings_to_json(warnings: &[crate::compiler::Warning]) -> Vec<Value> {
    warnings
        .iter()
        .map(|w| {
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
        .collect()
}

///
/// Takes source code and an options object, returns a result object
/// matching the official `svelte/compiler` output shape.
#[napi(js_name = "compile")]
pub fn napi_compile(source: String, options: Option<NapiCompileOptions>) -> napi::Result<Value> {
    let opts = options_to_compile(options);

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

            let warnings: Vec<Value> = warnings_to_json(&result.warnings);

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

// =============================================================================
// Typed compile-options surface (replaces serde_json::Value-driven parsing)
// =============================================================================
//
// Every `#[napi(object)]` field is read straight out of the V8 object
// by napi-derive's generated FromNapiValue impl — no
// `serde_json::Value` intermediate, no HashMap lookups, no per-field
// `.as_bool()` / `.as_str()` ceremony. Unknown JS fields (e.g. the
// `cssHash` / `warningFilter` callbacks Vite passes) are silently
// ignored, matching the prior behaviour.
//
// `sourcemap` and `cssHash`/`warningFilter` stay polymorphic on the
// JS side — `sourcemap` can be a v3 JSON object or its serialized
// string form, the callbacks are JS functions. The Value-typed
// `sourcemap` field accepts either; the callback fields aren't
// modelled here because the compiler core can't call back into JS.

#[napi(object)]
pub struct NapiExperimentalOptions {
    pub r#async: Option<bool>,
}

#[napi(object)]
pub struct NapiCompatibilityOptions {
    pub component_api: Option<u32>,
}

/// Typed mirror of `CompileOptions` for the NAPI boundary. Field
/// names follow `#[napi(object)]`'s automatic camelCase conversion,
/// so the JS shape stays identical to the legacy `Value`-typed
/// `options` argument (`{ dev, generate, filename, rootDir, … }`).
#[napi(object)]
pub struct NapiCompileOptions {
    pub dev: Option<bool>,
    pub generate: Option<String>,
    pub filename: Option<String>,
    pub root_dir: Option<String>,
    pub name: Option<String>,
    pub custom_element: Option<bool>,
    pub accessors: Option<bool>,
    pub namespace: Option<String>,
    pub immutable: Option<bool>,
    pub css: Option<String>,
    pub preserve_comments: Option<bool>,
    pub preserve_whitespace: Option<bool>,
    pub runes: Option<bool>,
    pub disclose_version: Option<bool>,
    /// SourceMap v3 object **or** its serialized JSON string — both
    /// accepted. Preprocessors pass an object; the test harness
    /// sometimes passes a string. Anything else (number, array,
    /// boolean) is ignored.
    pub sourcemap: Option<Value>,
    pub output_filename: Option<String>,
    pub css_output_filename: Option<String>,
    pub hmr: Option<bool>,
    pub modern_ast: Option<bool>,
    pub experimental: Option<NapiExperimentalOptions>,
    pub compatibility: Option<NapiCompatibilityOptions>,
    /// Pre-computed deterministic hash for the test harness (the JS
    /// `cssHash` callback can't be called from Rust).
    pub css_hash_override: Option<String>,
    pub fragments: Option<String>,
}

impl NapiCompileOptions {
    /// Convert into the compiler's native `CompileOptions`. The
    /// defaults match `CompileOptions::default()`; only fields the JS
    /// caller actually set are propagated.
    fn into_compile_options(self) -> CompileOptions {
        let mut opts = CompileOptions::default();
        if let Some(v) = self.dev {
            opts.dev = v;
        }
        if let Some(v) = self.generate.as_deref() {
            opts.generate = match v {
                "server" | "ssr" => GenerateMode::Server,
                "false" => GenerateMode::None,
                _ => GenerateMode::Client,
            };
        }
        if let Some(v) = self.filename {
            opts.filename = Some(v);
        }
        // rootDir defaults to the process's cwd (matches official Svelte)
        if let Some(v) = self.root_dir {
            opts.root_dir = Some(v);
        } else if let Ok(cwd) = std::env::current_dir() {
            opts.root_dir = Some(cwd.to_string_lossy().to_string());
        }
        if let Some(v) = self.name {
            opts.name = Some(v);
        }
        if let Some(v) = self.custom_element {
            opts.custom_element = v;
        }
        if let Some(v) = self.accessors {
            opts.accessors = v;
        }
        if let Some(v) = self.namespace.as_deref() {
            opts.namespace = match v {
                "svg" => Namespace::Svg,
                "mathml" => Namespace::Mathml,
                _ => Namespace::Html,
            };
        }
        if let Some(v) = self.immutable {
            opts.immutable = v;
        }
        if let Some(v) = self.css.as_deref() {
            opts.css = match v {
                "injected" => CssMode::Injected,
                _ => CssMode::External,
            };
        }
        if let Some(v) = self.preserve_comments {
            opts.preserve_comments = v;
        }
        if let Some(v) = self.preserve_whitespace {
            opts.preserve_whitespace = v;
        }
        if let Some(v) = self.runes {
            opts.runes = Some(v);
        }
        if let Some(v) = self.disclose_version {
            opts.disclose_version = v;
        }
        if let Some(v) = self.sourcemap {
            // Preprocessors pass the map as an object; the test harness
            // and some callers pass it as the serialized JSON string.
            // Accept either; ignore anything else.
            if let Some(s) = v.as_str() {
                opts.sourcemap = Some(s.to_string());
            } else if v.is_object() || v.is_array() {
                opts.sourcemap = Some(serde_json::to_string(&v).unwrap_or_default());
            }
        }
        if let Some(v) = self.output_filename {
            opts.output_filename = Some(v);
        }
        if let Some(v) = self.css_output_filename {
            opts.css_output_filename = Some(v);
        }
        if let Some(v) = self.hmr {
            opts.hmr = v;
        }
        if let Some(v) = self.modern_ast {
            opts.modern_ast = v;
        }
        if let Some(exp) = self.experimental
            && let Some(v) = exp.r#async
        {
            opts.experimental = ExperimentalOptions { r#async: v };
        }
        if let Some(compat) = self.compatibility
            && let Some(v) = compat.component_api
        {
            opts.compatibility.component_api = if v == 4 {
                crate::compiler::ComponentApi::V4
            } else {
                crate::compiler::ComponentApi::V5
            };
        }
        if let Some(hash_override) = self.css_hash_override {
            opts.css_hash = Some(std::sync::Arc::new(
                move |_: &crate::compiler::CssHashInput| hash_override.clone(),
            ));
        }
        if let Some(v) = self.fragments.as_deref() {
            opts.fragments = match v {
                "tree" => crate::compiler::FragmentMode::Tree,
                _ => crate::compiler::FragmentMode::Html,
            };
        }
        opts
    }
}

/// Typed mirror of `ModuleCompileOptions`.
#[napi(object)]
pub struct NapiModuleCompileOptions {
    pub dev: Option<bool>,
    pub generate: Option<String>,
    pub filename: Option<String>,
    pub root_dir: Option<String>,
    pub experimental: Option<NapiExperimentalOptions>,
}

impl NapiModuleCompileOptions {
    fn into_module_compile_options(self) -> ModuleCompileOptions {
        let mut opts = ModuleCompileOptions::default();
        if let Some(v) = self.dev {
            opts.dev = v;
        }
        if let Some(v) = self.generate.as_deref() {
            opts.generate = match v {
                "server" | "ssr" => GenerateMode::Server,
                "false" => GenerateMode::None,
                _ => GenerateMode::Client,
            };
        }
        if let Some(v) = self.filename {
            opts.filename = Some(v);
        }
        if let Some(v) = self.root_dir {
            opts.root_dir = Some(v);
        }
        if let Some(exp) = self.experimental
            && let Some(v) = exp.r#async
        {
            opts.experimental = ExperimentalOptions { r#async: v };
        }
        opts
    }
}

/// Compatibility wrapper: convert an Option<NapiCompileOptions> (the
/// typed surface) into `CompileOptions`. `None` and `Some(empty)`
/// both produce the defaults.
fn options_to_compile(opts: Option<NapiCompileOptions>) -> CompileOptions {
    opts.map(NapiCompileOptions::into_compile_options)
        .unwrap_or_else(|| {
            let mut o = CompileOptions::default();
            if let Ok(cwd) = std::env::current_dir() {
                o.root_dir = Some(cwd.to_string_lossy().to_string());
            }
            o
        })
}

fn options_to_module_compile(opts: Option<NapiModuleCompileOptions>) -> ModuleCompileOptions {
    opts.map(NapiModuleCompileOptions::into_module_compile_options)
        .unwrap_or_default()
}

/// Compile a Svelte module (.svelte.js/.svelte.ts).
#[napi(js_name = "compileModule")]
pub fn napi_compile_module(
    source: String,
    options: Option<NapiModuleCompileOptions>,
) -> napi::Result<Value> {
    let opts = options_to_module_compile(options);
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
                // Forward module-compilation warnings instead of dropping them (H-084).
                "warnings": warnings_to_json(&result.warnings),
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

/// Options accepted by `preprocess()`. Mirrors the upstream Svelte
/// signature `preprocess(source, preprocessors, options?: { filename? })`.
#[napi(object)]
pub struct PreprocessOptions {
    pub filename: Option<String>,
}

/// Run rsvelte's preprocessor pipeline, bridging JS preprocessor
/// callbacks through `napi::threadsafe_function::ThreadsafeFunction`.
///
/// `preprocessors` is a `PreprocessorGroup | PreprocessorGroup[]` —
/// each group is a `{ name?, markup?, script?, style? }` object matching
/// `svelte/preprocess`'s contract. Callbacks may be sync or `async` and
/// may return either a `{ code, map?, dependencies?, attributes? }`
/// object or `undefined`/`null` to skip the file. Callbacks are invoked
/// on the JS thread via N-API's ThreadsafeFunction machinery — the
/// heavy lifting (tag extraction, source-map chaining) stays in Rust.
///
/// Shape mirrors `svelte/preprocess`: `{ code, map, dependencies }`.
#[napi(js_name = "preprocess")]
pub fn napi_preprocess(
    env: Env,
    source: String,
    preprocessors: napi::bindgen_prelude::Either<
        Vec<napi::bindgen_prelude::Object>,
        napi::bindgen_prelude::Object,
    >,
    options: Option<PreprocessOptions>,
) -> napi::Result<napi::JsObject> {
    use napi::bindgen_prelude::Either;
    // Accept both `PreprocessorGroup[]` and `PreprocessorGroup` — matches
    // the upstream Svelte API which allows a single group or an array.
    // We probe `Vec` first since JS arrays satisfy `typeof === "object"`
    // and would otherwise match the single-group branch.
    let groups: Vec<napi::bindgen_prelude::Object> = match preprocessors {
        Either::A(list) => list,
        Either::B(single) => vec![single],
    };
    // Extract ThreadsafeFunctions synchronously so the JS-bound `Object`
    // values never cross the await boundary (they're not Send).
    let extracted = preprocess_bridge::extract_groups(groups)?;
    let rust_groups = preprocess_bridge::build_groups(extracted);
    let filename = options.and_then(|o| o.filename);

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
    use napi::Status;
    use napi::bindgen_prelude::{FromNapiValue, Object, Promise};
    use napi::threadsafe_function::ThreadsafeFunction;
    use rustc_hash::FxHashMap;
    use serde_json::Value;

    // Either a Promise<T> or a plain T from a threadsafe_function return.
    //
    // We can't use napi-rs's `Either<Promise<T>, T>` here because
    // `Promise::validate` doesn't fail on non-Promise input — it
    // substitutes a *rejected* Promise. Either then unconditionally picks
    // variant A and calls `Promise::from_napi_value` on the original
    // non-Promise value, which crashes inside `napi_call_function(then)`
    // with `Failed to call then method` and triggers the FATAL ERROR at
    // threadsafe_function.rs:749 — aborting the whole Node process.
    //
    // Probe `napi_is_promise` directly *before* the typed conversion
    // and dispatch from there. The Svelte preprocessor contract allows
    // sync `Processed` returns alongside `Promise<Processed>`, so this
    // matters in practice the moment any user preprocessor in the chain
    // happens to be synchronous (e.g. an inline `vitePreprocess`-style
    // markup filter that just returns `{ code }` without an `async`).
    pub(super) enum MaybePromise<T: FromNapiValue + 'static> {
        Promise(Promise<T>),
        Value(T),
    }

    impl<T: FromNapiValue + 'static> FromNapiValue for MaybePromise<T> {
        unsafe fn from_napi_value(
            env: napi::sys::napi_env,
            napi_val: napi::sys::napi_value,
        ) -> napi::Result<Self> {
            let mut is_promise = false;
            let status = unsafe { napi::sys::napi_is_promise(env, napi_val, &mut is_promise) };
            if status != napi::sys::Status::napi_ok {
                return Err(napi::Error::from_status(napi::Status::from(status)));
            }
            if is_promise {
                let p = unsafe { Promise::<T>::from_napi_value(env, napi_val)? };
                Ok(MaybePromise::Promise(p))
            } else {
                let v = unsafe { T::from_napi_value(env, napi_val)? };
                Ok(MaybePromise::Value(v))
            }
        }
    }

    // Fatal strategy: the user-supplied JS callback receives the options
    // object as its sole argument — matching the upstream Svelte
    // preprocessor contract `(opts) => Processed | undefined`. The
    // `CalleeHandled = false` const generic suppresses the legacy
    // err-as-first-arg shape that would otherwise break every preprocessor
    // that destructures `{ content, filename }`.
    pub(super) type Tsfn =
        ThreadsafeFunction<Value, MaybePromise<Option<Value>>, Value, Status, false, false, 0>;
    pub(super) type ArcTsfn = std::sync::Arc<Tsfn>;

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
                    name: obj.get::<String>("name")?,
                    markup: obj.get::<Tsfn>("markup")?,
                    script: obj.get::<Tsfn>("script")?,
                    style: obj.get::<Tsfn>("style")?,
                })
            })
            .collect()
    }

    pub(super) fn build_groups(extracted: Vec<Extracted>) -> Vec<PreprocessorGroup> {
        extracted
            .into_iter()
            .map(|g| PreprocessorGroup {
                name: g.name,
                markup: g.markup.map(|t| make_markup_bridge(ArcTsfn::new(t))),
                script: g.script.map(|t| make_tag_bridge(ArcTsfn::new(t), "script")),
                style: g.style.map(|t| make_tag_bridge(ArcTsfn::new(t), "style")),
            })
            .collect()
    }

    fn make_markup_bridge(tsfn: ArcTsfn) -> MarkupPreprocessorFn {
        Box::new(
            move |opts: MarkupPreprocessorOptions| -> PreprocessorResult {
                let tsfn = ArcTsfn::clone(&tsfn);
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

    fn make_tag_bridge(tsfn: ArcTsfn, _kind: &'static str) -> PreprocessorFn {
        Box::new(move |opts: PreprocessorOptions| -> PreprocessorResult {
            let tsfn = ArcTsfn::clone(&tsfn);
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
        // The upstream Svelte preprocessor contract allows the callback to
        // return `Processed | Promise<Processed> | undefined | null`,
        // sync or async. `MaybePromise<Option<Value>>` probes `napi_is_promise`
        // *before* the typed conversion, so we never let napi-rs call
        // `.then()` on a non-Promise value (which would abort the process via
        // `napi_fatal_error`, surfacing as `threadsafe_function.rs:749 Failed
        // to convert return value … Failed to call then method`). The outer
        // `Option` collapses `undefined`/`null` to `None` on both paths.
        match tsfn.call_async(arg).await {
            Ok(MaybePromise::Promise(promise)) => match promise.await {
                Ok(Some(v)) => Ok(v),
                Ok(None) => Ok(Value::Null),
                Err(e) => Err(PreprocessError::Other(format!("{e}"))),
            },
            Ok(MaybePromise::Value(Some(v))) => Ok(v),
            Ok(MaybePromise::Value(None)) => Ok(Value::Null),
            Err(e) => Err(PreprocessError::Other(format!("{e}"))),
        }
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
            Some(SourceMapInput::Decoded(decoded)) => decoded_to_v3_json(&decoded),
        };
        let deps: Vec<Value> = p.dependencies.into_iter().map(Value::String).collect();
        serde_json::json!({
            "code": p.code,
            "map": map,
            "dependencies": deps,
        })
    }

    /// Serialize a `SimpleDecodedMap` to a standard [Source Map v3] JSON
    /// object — camelCase keys (`sourcesContent`, `sourceRoot`) and a
    /// VLQ-encoded `mappings` string — so downstream tools (Vite,
    /// Rolldown, magic-string consumers) can ingest it directly.
    ///
    /// [Source Map v3]: https://sourcemaps.info/spec.html
    fn decoded_to_v3_json(map: &SimpleDecodedMap) -> Value {
        let mut obj = serde_json::Map::new();
        obj.insert(
            "version".to_string(),
            Value::Number(serde_json::Number::from(map.version.unwrap_or(3))),
        );
        if let Some(ref file) = map.file {
            obj.insert("file".to_string(), Value::String(file.clone()));
        }
        if let Some(ref source_root) = map.source_root {
            obj.insert("sourceRoot".to_string(), Value::String(source_root.clone()));
        }
        obj.insert(
            "sources".to_string(),
            Value::Array(map.sources.iter().cloned().map(Value::String).collect()),
        );
        if let Some(ref contents) = map.sources_content {
            obj.insert(
                "sourcesContent".to_string(),
                Value::Array(
                    contents
                        .iter()
                        .map(|c| c.clone().map_or(Value::Null, Value::String))
                        .collect(),
                ),
            );
        }
        obj.insert(
            "names".to_string(),
            Value::Array(map.names.iter().cloned().map(Value::String).collect()),
        );
        obj.insert(
            "mappings".to_string(),
            Value::String(encode_mappings(&map.mappings)),
        );
        Value::Object(obj)
    }

    /// VLQ-encode a decoded `mappings` array (`Vec<Vec<Vec<i64>>>`) into
    /// the Source Map v3 string form: lines separated by `;`, segments
    /// within a line separated by `,`, fields within a segment as
    /// relative-encoded VLQs.
    fn encode_mappings(mappings: &[Vec<Vec<i64>>]) -> String {
        let mut out = String::new();
        // Source index / original line / original column / name index
        // run relative to the *previous segment*, regardless of line.
        // Generated column resets at each `;` (per spec).
        let mut prev_source: i64 = 0;
        let mut prev_orig_line: i64 = 0;
        let mut prev_orig_col: i64 = 0;
        let mut prev_name: i64 = 0;
        for (i, line) in mappings.iter().enumerate() {
            if i > 0 {
                out.push(';');
            }
            let mut prev_gen_col: i64 = 0;
            for (j, segment) in line.iter().enumerate() {
                if j > 0 {
                    out.push(',');
                }
                if segment.is_empty() {
                    continue;
                }
                let gen_col = segment[0];
                vlq_encode(&mut out, gen_col - prev_gen_col);
                prev_gen_col = gen_col;
                if segment.len() >= 4 {
                    let src = segment[1];
                    let orig_line = segment[2];
                    let orig_col = segment[3];
                    vlq_encode(&mut out, src - prev_source);
                    vlq_encode(&mut out, orig_line - prev_orig_line);
                    vlq_encode(&mut out, orig_col - prev_orig_col);
                    prev_source = src;
                    prev_orig_line = orig_line;
                    prev_orig_col = orig_col;
                    if segment.len() >= 5 {
                        let name = segment[4];
                        vlq_encode(&mut out, name - prev_name);
                        prev_name = name;
                    }
                }
            }
        }
        out
    }

    const BASE64: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    fn vlq_encode(out: &mut String, value: i64) {
        let mut vlq: u64 = if value < 0 {
            ((-value as u64) << 1) | 1
        } else {
            (value as u64) << 1
        };
        loop {
            let mut digit = (vlq & 0x1f) as u8;
            vlq >>= 5;
            if vlq > 0 {
                digit |= 0x20;
            }
            out.push(BASE64[digit as usize] as char);
            if vlq == 0 {
                break;
            }
        }
    }
}

// =============================================================================
// Raw transfer — Step 1: Buffer-based code/map (no JSON re-encoding on boundary)
// =============================================================================
//
// `compileBuffers` mirrors `compile()` but returns the heavy payloads
// (generated code, sourcemap JSON, CSS) as raw `Buffer`s. Each `Buffer`
// takes ownership of the underlying `Vec<u8>` directly — no V8 string
// conversion, no `serde_json::Value` round-trip, no double-parse of the
// sourcemap. The JS shim wraps the result with lazy `string`/`object`
// getters so callers see the same `{ js: { code, map }, … }` shape as
// the legacy `compile()` export.

/// JS-side `{ code, map }` shape with `Buffer` payloads. UTF-8 only —
/// the JS side lifts to `string` on demand via `TextDecoder` / `toString`.
#[napi(object)]
pub struct CompileBuffersJs {
    pub code: Buffer,
    pub map: Option<Buffer>,
}

#[napi(object)]
pub struct CompileBuffersCss {
    pub code: Buffer,
    pub map: Option<Buffer>,
    pub has_global: bool,
}

#[napi(object)]
pub struct NapiPosition {
    pub line: u32,
    pub column: u32,
    pub character: u32,
}

#[napi(object)]
pub struct NapiWarning {
    pub code: String,
    pub message: String,
    pub filename: Option<String>,
    pub start: Option<NapiPosition>,
    pub end: Option<NapiPosition>,
    pub frame: Option<String>,
}

#[napi(object)]
pub struct CompileBuffersResult {
    pub js: CompileBuffersJs,
    pub css: Option<CompileBuffersCss>,
    pub warnings: Vec<NapiWarning>,
    pub runes: bool,
}

/// `compile()` variant that avoids serde_json on the Rust↔JS boundary.
///
/// The generated code and sourcemap JSON are handed to V8 as
/// `Buffer`s (zero-copy from the underlying `Vec<u8>`), so napi-rs
/// performs a single ArrayBuffer wrap per payload instead of a UTF-16
/// string copy. Warnings stay as a structured `#[napi(object)]` since
/// they're small and the JS side reads them eagerly.
#[napi(js_name = "compileBuffers")]
pub fn napi_compile_buffers(
    source: String,
    options: Option<NapiCompileOptions>,
) -> napi::Result<CompileBuffersResult> {
    let opts = options_to_compile(options);
    match rust_compile(&source, opts) {
        Ok(result) => Ok(CompileBuffersResult {
            js: CompileBuffersJs {
                code: Buffer::from(result.js.code.into_bytes()),
                map: result.js.map.map(|m| Buffer::from(m.into_bytes())),
            },
            css: result.css.map(|c| CompileBuffersCss {
                code: Buffer::from(c.code.into_bytes()),
                map: c.map.map(|m| Buffer::from(m.into_bytes())),
                has_global: c.has_global,
            }),
            warnings: result.warnings.into_iter().map(warning_to_napi).collect(),
            runes: result.metadata.runes,
        }),
        Err(e) => Err(napi::Error::from_reason(format!("{e:?}"))),
    }
}

/// `compileModule()` variant matching `compileBuffers`'s output shape.
#[napi(js_name = "compileModuleBuffers")]
pub fn napi_compile_module_buffers(
    source: String,
    options: Option<NapiModuleCompileOptions>,
) -> napi::Result<CompileBuffersResult> {
    let opts = options_to_module_compile(options);

    match rust_compile_module(&source, opts) {
        Ok(result) => Ok(CompileBuffersResult {
            js: CompileBuffersJs {
                code: Buffer::from(result.js.code.into_bytes()),
                map: result.js.map.map(|m| Buffer::from(m.into_bytes())),
            },
            css: None,
            warnings: Vec::new(),
            runes: true,
        }),
        Err(e) => Err(napi::Error::from_reason(format!("{e:?}"))),
    }
}

fn warning_to_napi(w: crate::compiler::Warning) -> NapiWarning {
    NapiWarning {
        code: w.code,
        message: w.message,
        filename: w.filename,
        start: w.start.map(position_to_napi),
        end: w.end.map(position_to_napi),
        frame: w.frame,
    }
}

fn position_to_napi(p: crate::compiler::Position) -> NapiPosition {
    NapiPosition {
        line: p.line as u32,
        column: p.column as u32,
        character: p.character as u32,
    }
}

// =============================================================================
// Raw transfer — Step 2: Single binary envelope (one Buffer, lazy decode in JS)
// =============================================================================
//
// `compileEnvelope` packs the entire `CompileResult` into one
// fixed-layout byte buffer (`crate::napi_raw`) and hands it to V8 as
// a single `Buffer`. The JS shim's `decodeEnvelope` slices fields
// out on demand — no `serde_json` on the boundary, no V8 object tree
// construction for the warning array unless the caller actually
// reads `.warnings`.
//
// Step 3 (further down) layers bumpalo allocation on top of this
// same envelope: the buffer becomes a view into arena memory rather
// than an owned `Vec<u8>`.

/// `compile()` returning a single packed envelope buffer.
/// See `crate::napi_raw` for the byte-level format.
#[napi(js_name = "compileEnvelope")]
pub fn napi_compile_envelope(
    source: String,
    options: Option<NapiCompileOptions>,
) -> napi::Result<Buffer> {
    let opts = options_to_compile(options);
    match rust_compile(&source, opts) {
        Ok(result) => Ok(Buffer::from(crate::napi_raw::encode_to_vec(&result))),
        Err(e) => Err(napi::Error::from_reason(format!("{e:?}"))),
    }
}

// =============================================================================
// Raw transfer — Step 3: bumpalo arena + zero-copy Buffer
// =============================================================================
//
// `compileEnvelopeZeroCopy` is the same envelope format as Step 2,
// but the bytes are allocated into a `bumpalo::Bump` arena and
// handed to V8 as a Buffer that *borrows* arena memory (no copy at
// all on the boundary — V8 just stores the raw pointer + a finalizer
// that drops the Bump).
//
// Why bother on top of Step 2's `Buffer::from(Vec<u8>)`, which is
// already zero-copy at the napi-rs level? Two reasons:
//
//   1. **One allocation per compile.** Step 2 uses `Vec::with_capacity`
//      so it's already one alloc, but Vec reserves a power-of-two
//      capacity and may over-allocate; a `Bump` with an exact-sized
//      slice burns no extra bytes. More importantly, this is the
//      *plumbing* for future moves: when the AST or codegen output
//      starts living in a Bump (PERF_ROADMAP.md), the same
//      `create_buffer_with_borrowed_data` path generalises to
//      "pass any arena byte range to JS without copying."
//
//   2. **Single finalizer per compile.** Step 2 uses napi-rs's
//      per-Buffer Box<Buffer> finalizer (one drop call per buffer).
//      Step 3 collapses to one Box<Bump> drop. Negligible per call,
//      but it grows linearly with batch size.

/// Zero-copy variant of {@link napi_compile_envelope}. Allocates the
/// envelope bytes inside a `bumpalo::Bump`, hands V8 a Buffer view
/// over the arena, and drops the arena from a finalizer when V8
/// finalises the Buffer.
///
/// # Safety
///
/// We pass a raw pointer into the bump arena to napi via
/// `create_buffer_with_borrowed_data`. The arena is leaked via
/// `Box::into_raw` and only freed inside the finalizer callback,
/// after V8 has agreed it's done with the buffer. No Rust code
/// retains the pointer after the call returns.
#[napi(js_name = "compileEnvelopeZeroCopy")]
pub fn napi_compile_envelope_zero_copy(
    env: Env,
    source: String,
    options: Option<NapiCompileOptions>,
) -> napi::Result<JsBuffer> {
    let opts = options_to_compile(options);
    let result = match rust_compile(&source, opts) {
        Ok(r) => r,
        Err(e) => return Err(napi::Error::from_reason(format!("{e:?}"))),
    };
    let bump = Box::new(bumpalo::Bump::with_capacity(
        crate::napi_raw::estimate_size(&result),
    ));
    let bump_ptr: *mut bumpalo::Bump = Box::into_raw(bump);
    // SAFETY: bump_ptr is freshly leaked from Box::into_raw and not
    // aliased; we re-acquire ownership via Box::from_raw inside the
    // finalizer below.
    let bump_ref: &bumpalo::Bump = unsafe { &*bump_ptr };
    let slice = crate::napi_raw::encode_into_bump(bump_ref, &result);
    let ptr = slice.as_mut_ptr();
    let len = slice.len();

    // SAFETY: ptr/len describe a valid slice inside `*bump_ptr`. The
    // finalizer drops the Box and frees the arena bytes; V8 calls the
    // finalizer exactly once when the Buffer is GC'd.
    let js_buf_value = unsafe {
        env.create_buffer_with_borrowed_data(
            ptr,
            len,
            bump_ptr,
            |_env, bump_ptr: *mut bumpalo::Bump| {
                // SAFETY: `bump_ptr` is the same pointer we leaked above,
                // never aliased, and the finalizer fires at most once.
                let _bump: Box<bumpalo::Bump> = Box::from_raw(bump_ptr);
                // Drop here frees the arena bytes; V8 only finalises once.
            },
        )?
    };
    Ok(js_buf_value.into_raw())
}

/// `compileModule` counterpart of `compileEnvelopeZeroCopy`.
#[napi(js_name = "compileModuleEnvelopeZeroCopy")]
pub fn napi_compile_module_envelope_zero_copy(
    env: Env,
    source: String,
    options: Option<NapiModuleCompileOptions>,
) -> napi::Result<JsBuffer> {
    let opts = options_to_module_compile(options);
    let result = match rust_compile_module(&source, opts) {
        Ok(r) => r,
        Err(e) => return Err(napi::Error::from_reason(format!("{e:?}"))),
    };
    let cr = crate::compiler::CompileResult {
        js: result.js,
        css: None,
        warnings: Vec::new(),
        metadata: crate::compiler::CompileMetadata { runes: true },
        ast: None,
    };
    let bump = Box::new(bumpalo::Bump::with_capacity(
        crate::napi_raw::estimate_size(&cr),
    ));
    let bump_ptr: *mut bumpalo::Bump = Box::into_raw(bump);
    let bump_ref: &bumpalo::Bump = unsafe { &*bump_ptr };
    let slice = crate::napi_raw::encode_into_bump(bump_ref, &cr);
    let ptr = slice.as_mut_ptr();
    let len = slice.len();
    let js_buf_value = unsafe {
        env.create_buffer_with_borrowed_data(
            ptr,
            len,
            bump_ptr,
            |_env, bump_ptr: *mut bumpalo::Bump| {
                // SAFETY: same pointer as Box::into_raw above, fired once.
                let _bump: Box<bumpalo::Bump> = Box::from_raw(bump_ptr);
            },
        )?
    };
    Ok(js_buf_value.into_raw())
}

/// `compileModule()` returning the same packed envelope. The envelope
/// uses the empty-CSS / empty-warnings encoding, so the JS decoder is
/// identical for both entry points.
#[napi(js_name = "compileModuleEnvelope")]
pub fn napi_compile_module_envelope(
    source: String,
    options: Option<NapiModuleCompileOptions>,
) -> napi::Result<Buffer> {
    let opts = options_to_module_compile(options);
    match rust_compile_module(&source, opts) {
        Ok(result) => {
            // Adapt the module result into the same `CompileResult` shape
            // the envelope encoder expects. Module compiles never produce
            // CSS or warnings, and runes mode is always on, so the
            // resulting envelope is the minimal js-only form.
            let cr = crate::compiler::CompileResult {
                js: result.js,
                css: None,
                warnings: Vec::new(),
                metadata: crate::compiler::CompileMetadata { runes: true },
                ast: None,
            };
            Ok(Buffer::from(crate::napi_raw::encode_to_vec(&cr)))
        }
        Err(e) => Err(napi::Error::from_reason(format!("{e:?}"))),
    }
}

// =============================================================================
// Batch compile: one NAPI call → N files in parallel → one Buffer
// =============================================================================
//
// `compileBatch([{source, options}, …])` hands the whole worklist to
// `crate::compiler::compile_batch`, which uses rayon to compile in
// parallel, and packs the resulting `Result<CompileResult, _>`s into
// one batch envelope (`crate::napi_raw::encode_batch_to_vec`). One
// `napi_create_external_buffer` per call regardless of N — the
// per-file boundary cost goes from O(N) to O(1).
//
// Use case: Vite's dev server / SSR pre-render, which compile many
// `.svelte` files in quick succession. With the legacy `compile()`
// loop, each file pays the NAPI crossing + serde_json round-trip;
// with `compileBatch` they share one.

/// Single entry in a `compileBatch` worklist.
#[napi(object)]
pub struct CompileBatchInput {
    pub source: String,
    pub options: Option<NapiCompileOptions>,
}

/// Compile multiple Svelte components in parallel via rayon, packing
/// the results into one batch envelope. See `src/napi_raw.rs` for the
/// byte format.
#[napi(js_name = "compileBatch")]
pub fn napi_compile_batch(inputs: Vec<CompileBatchInput>) -> napi::Result<Buffer> {
    // Convert each entry's typed options up front. The conversion is
    // pure (no NAPI touchpoint) so it could in principle run in
    // parallel, but the per-call work is trivial and this keeps the
    // rayon stage focused on the actual compile.
    let parsed: Vec<(String, crate::compiler::CompileOptions)> = inputs
        .into_iter()
        .map(|item| (item.source, options_to_compile(item.options)))
        .collect();

    // Compile in parallel. `compile_batch` takes `&[(&str, CompileOptions)]`,
    // so we materialise the borrowed view once.
    let borrowed: Vec<(&str, crate::compiler::CompileOptions)> = parsed
        .iter()
        .map(|(s, o)| (s.as_str(), o.clone()))
        .collect();
    let results = crate::compiler::compile_batch(&borrowed);

    // Build the BatchEntry view over the results so the encoder can
    // walk them without taking ownership. Error messages format
    // lazily and stay on the stack until encode time.
    let err_strings: Vec<Option<String>> = results
        .iter()
        .map(|r| match r {
            Ok(_) => None,
            Err(e) => Some(format!("{e:?}")),
        })
        .collect();

    let entries: Vec<crate::napi_raw::BatchEntry<'_>> = results
        .iter()
        .zip(err_strings.iter())
        .map(|(r, e)| match r {
            Ok(cr) => crate::napi_raw::BatchEntry::Ok(cr),
            Err(_) => crate::napi_raw::BatchEntry::Err(e.as_deref().unwrap_or("unknown error")),
        })
        .collect();

    Ok(Buffer::from(crate::napi_raw::encode_batch_to_vec(&entries)))
}

// =============================================================================
// Async compile — release the JS event loop while Rust works
// =============================================================================
//
// The sync `compileEnvelope` / `compileBatch` paths block the JS
// thread while Rust runs. For Vite's dev server (which awaits each
// transform) that means no other JS callback can interleave with
// compilation.
//
// `compileEnvelopeAsync` / `compileBatchAsync` wrap the same logic in
// `napi::AsyncTask` so the work runs on a libuv worker thread and
// the JS caller gets a `Promise<Buffer>`. They share the same v1 /
// RSVB envelope format, so the same `decodeEnvelope` / `decodeBatch`
// callers can decode the result — `await` is the only thing that
// changes on the consumer side.

use napi::Task;
use napi::bindgen_prelude::AsyncTask;

/// Async single-file compile. `compute()` runs on a libuv worker
/// thread; `resolve()` wraps the resulting envelope `Vec<u8>` into
/// a Node `Buffer` on the main thread.
pub struct CompileEnvelopeTask {
    source: String,
    options: CompileOptions,
}

impl Task for CompileEnvelopeTask {
    type Output = Vec<u8>;
    type JsValue = Buffer;

    fn compute(&mut self) -> napi::Result<Self::Output> {
        // `std::mem::take(&mut self.options)` would be ideal, but
        // `CompileOptions` isn't `Default`-cheap (the css_hash Arc
        // field has to be re-Arc'd). Clone is fine here — options are
        // small and we only pay it once per call.
        let result = rust_compile(&self.source, self.options.clone())
            .map_err(|e| napi::Error::from_reason(format!("{e:?}")))?;
        Ok(crate::napi_raw::encode_to_vec(&result))
    }

    fn resolve(&mut self, _env: napi::Env, output: Self::Output) -> napi::Result<Self::JsValue> {
        Ok(Buffer::from(output))
    }
}

/// Async variant of `compileEnvelope` — returns `Promise<Buffer>` to
/// the JS caller, frees the JS event loop while rayon / the worker
/// thread runs the compile.
#[napi(js_name = "compileEnvelopeAsync")]
pub fn napi_compile_envelope_async(
    source: String,
    options: Option<NapiCompileOptions>,
) -> AsyncTask<CompileEnvelopeTask> {
    AsyncTask::new(CompileEnvelopeTask {
        source,
        options: options_to_compile(options),
    })
}

/// Async variant of `compileBatch` — same `compile_batch` (rayon
/// `par_iter`) on the worker thread, same RSVB envelope back.
pub struct CompileBatchTask {
    inputs: Vec<(String, CompileOptions)>,
}

impl Task for CompileBatchTask {
    type Output = Vec<u8>;
    type JsValue = Buffer;

    fn compute(&mut self) -> napi::Result<Self::Output> {
        let borrowed: Vec<(&str, CompileOptions)> = self
            .inputs
            .iter()
            .map(|(s, o)| (s.as_str(), o.clone()))
            .collect();
        let results = crate::compiler::compile_batch(&borrowed);
        let err_strings: Vec<Option<String>> = results
            .iter()
            .map(|r| match r {
                Ok(_) => None,
                Err(e) => Some(format!("{e:?}")),
            })
            .collect();
        let entries: Vec<crate::napi_raw::BatchEntry<'_>> = results
            .iter()
            .zip(err_strings.iter())
            .map(|(r, e)| match r {
                Ok(cr) => crate::napi_raw::BatchEntry::Ok(cr),
                Err(_) => crate::napi_raw::BatchEntry::Err(e.as_deref().unwrap_or("unknown error")),
            })
            .collect();
        Ok(crate::napi_raw::encode_batch_to_vec(&entries))
    }

    fn resolve(&mut self, _env: napi::Env, output: Self::Output) -> napi::Result<Self::JsValue> {
        Ok(Buffer::from(output))
    }
}

#[napi(js_name = "compileBatchAsync")]
pub fn napi_compile_batch_async(inputs: Vec<CompileBatchInput>) -> AsyncTask<CompileBatchTask> {
    let parsed: Vec<(String, CompileOptions)> = inputs
        .into_iter()
        .map(|item| (item.source, options_to_compile(item.options)))
        .collect();
    AsyncTask::new(CompileBatchTask { inputs: parsed })
}
