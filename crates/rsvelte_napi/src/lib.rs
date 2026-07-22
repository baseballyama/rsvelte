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

// The global allocator is installed here (rather than at the lib root) so that
// the rlib doesn't carry a `#[global_allocator]` symbol — which collides with
// the cdylib's copy on Linux + fat LTO when a downstream bin links against
// both crate-type outputs (cargo issue rust-lang/cargo#6313). This module
// is only compiled when the `napi` feature is on, so the rlib stays clean
// for normal builds, and the cdylib gets a fast allocator when it ships as the
// NAPI prebuilt.
//
// We prefer mimalloc: an interleaved A/B over the full compile corpus measured
// it ~11% faster than jemalloc, and the allocation-bound profile (serde_json
// Value churn) is exactly the workload mimalloc wins on — the same reason the
// mold linker links mimalloc. mimalloc has the same initial-exec TLS issue as
// jemalloc when the cdylib is dlopen'd by Node on Linux ("cannot allocate memory
// in static TLS block"); the mimalloc crate's `local_dynamic_tls` feature
// (enabled in Cargo.toml) builds it with the local-dynamic TLS model to fix that.
// jemalloc remains the fallback when only the `jemalloc` feature is enabled.
#[cfg(all(
    feature = "mimalloc-alloc",
    not(target_arch = "wasm32"),
    not(target_os = "windows")
))]
#[global_allocator]
static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;

#[cfg(all(
    feature = "jemalloc",
    not(feature = "mimalloc-alloc"),
    not(target_arch = "wasm32"),
    not(target_os = "windows")
))]
#[global_allocator]
static GLOBAL: tikv_jemallocator::Jemalloc = tikv_jemallocator::Jemalloc;

use napi::bindgen_prelude::Buffer;
use napi::{Env, JsBuffer};
use napi_derive::napi;
use serde_json::Value;

use rsvelte_core::compiler::{
    CompileOptions, CssMode, ExperimentalOptions, GenerateMode, ModuleCompileOptions, Namespace,
    compile as rust_compile, compile_module as rust_compile_module,
};
use rsvelte_core::svelte2tsx::{
    Svelte2TsxMode, Svelte2TsxNamespace, Svelte2TsxOptions, SvelteVersion,
    svelte2tsx as rust_svelte2tsx,
};

/// Compile a Svelte component.
/// Serialise compiler warnings into the JSON shape the official
/// `svelte/compiler` output uses (`code`, `message`, `filename`, `start`, `end`,
/// `position`, `frame`).
fn warnings_to_json(warnings: &[rsvelte_core::compiler::Warning]) -> Vec<Value> {
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

/// Parse options surfaced to the NAPI bindings.
#[napi(object)]
pub struct NapiParseOptions {
    /// Skip emitting nested `loc:{ start, end }` blocks on Expression
    /// sub-trees. The top-level `start`/`end` byte offsets are still
    /// present. Callers that re-parse expression ranges with their own
    /// parser (e.g. `svelte-eslint-parser`) can opt in for a smaller
    /// AST and a faster `JSON.parse` (or, when paired with
    /// `parseEnvelope`, a tighter binary buffer).
    pub skip_expression_loc: Option<LenientScalar>,
    /// Skip emitting the full CSS `StyleSheet` AST — only the outer
    /// `start`/`end` positions are kept. The decoded `css` field
    /// becomes a minimal stub (`{ type: "StyleSheet", start, end,
    /// attributes: [], children: [], content: { start, end,
    /// styles: "", comment: null } }`). Use this when the downstream
    /// pipeline re-parses style blocks with its own CSS parser (e.g.
    /// `svelte-eslint-parser` uses postcss). Saves ~5–10 KB of buffer
    /// and the matching JSON-parse cost on the JS side per component.
    pub skip_css_ast: Option<LenientScalar>,
}

impl NapiParseOptions {
    /// Read a boolean parse flag, defaulting to `false` when unset and
    /// rejecting a non-boolean with the same message shape as the compile
    /// options.
    fn flag(field: Option<&LenientScalar>, keypath: &str) -> napi::Result<bool> {
        match field {
            Some(v) => coerce_bool(keypath, v),
            None => Ok(false),
        }
    }
}

/// Parse a Svelte component and return the AST as a JSON string.
///
/// Mirrors the wasm-exposed `parse_svelte` function but over the NAPI
/// boundary — no wasm linear-memory copy, no `wasm_bindgen` allocator.
/// The caller is responsible for `JSON.parse` on the returned string.
///
/// For the fastest path skip JSON entirely: see [`napi_parse_envelope`]
/// and the matching `decodeParseEnvelope` JS decoder.
#[napi(js_name = "parse")]
pub fn napi_parse(source: String, options: Option<NapiParseOptions>) -> napi::Result<String> {
    use rsvelte_core::compiler::phases::phase1_parse::{ParseOptions, parse as rust_parse};

    let parse_options = ParseOptions {
        skip_expression_loc: NapiParseOptions::flag(
            options
                .as_ref()
                .and_then(|o| o.skip_expression_loc.as_ref()),
            "skipExpressionLoc",
        )?,
        // The public AST API mirrors svelte/compiler `parse()`, which keeps
        // `leadingComments`/`trailingComments` on nodes.
        capture_comments: true,
        ..ParseOptions::default()
    };
    match rust_parse(&source, parse_options) {
        Ok(ast) => {
            // Serialize within the AST's arena so `JsNodeId`s in the
            // Serialize impls resolve (mirrors `wasm::parse_svelte`).
            rsvelte_core::ast::arena::with_serialize_arena(&ast.arena, || {
                // Spans are UTF-16 code-unit offsets to match svelte/compiler
                // (#793). ASCII source needs no remap — keep the fast path.
                if source.is_ascii() {
                    return serde_json::to_string(&ast)
                        .map_err(|e| napi::Error::from_reason(format!("serialize ast: {e}")));
                }
                let mut value = serde_json::to_value(&ast)
                    .map_err(|e| napi::Error::from_reason(format!("serialize ast: {e}")))?;
                let conv = rsvelte_core::compiler::legacy::Utf8ToUtf16::new(&source);
                rsvelte_core::compiler::legacy::convert_positions_to_utf16(&mut value, &conv);
                serde_json::to_string(&value)
                    .map_err(|e| napi::Error::from_reason(format!("serialize ast: {e}")))
            })
        }
        Err(e) => Err(napi::Error::from_reason(format!("{e:?}"))),
    }
}

/// Parse a Svelte component and return a raw-transfer envelope.
///
/// Encodes the AST into the rsvelte parse envelope format
/// (`napi_raw_parse`). Pair with the matching JS decoder in
/// `@rsvelte/vite-plugin-svelte-native/parse-envelope.js` to skip
/// `JSON.parse`'s tokenization cost on the JS side.
#[napi(js_name = "parseEnvelope")]
pub fn napi_parse_envelope(
    source: String,
    options: Option<NapiParseOptions>,
) -> napi::Result<Buffer> {
    use rsvelte_core::compiler::phases::phase1_parse::{ParseOptions, parse as rust_parse};

    let parse_options = ParseOptions {
        skip_expression_loc: NapiParseOptions::flag(
            options
                .as_ref()
                .and_then(|o| o.skip_expression_loc.as_ref()),
            "skipExpressionLoc",
        )?,
        ..ParseOptions::default()
    };
    let skip_loc = parse_options.skip_expression_loc;
    let skip_css = NapiParseOptions::flag(
        options.as_ref().and_then(|o| o.skip_css_ast.as_ref()),
        "skipCssAst",
    )?;
    let ast = rust_parse(&source, parse_options)
        .map_err(|e| napi::Error::from_reason(format!("{e:?}")))?;
    // napi-rs's `Vec<u8> → Buffer` conversion is already zero-copy
    // (V8 adopts the `Vec`'s allocation); a bumpalo-backed variant
    // measured ~20% slower on representative inputs because the
    // pre-sized arena + finalizer plumbing outweighs the saved
    // `Vec::reserve` calls for envelopes that fit in a single growth
    // step.
    let buf = rsvelte_core::napi_raw_parse::encode_root_to_vec_with_flags(
        &ast, &source, skip_loc, skip_css,
    );
    Ok(buf.into())
}

///
/// Takes source code and an options object, returns a result object
/// matching the official `svelte/compiler` output shape.
#[napi(js_name = "compile")]
pub fn napi_compile(source: String, options: Option<NapiCompileOptions>) -> napi::Result<Value> {
    let opts = options_to_compile(options)?;

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

/// Serialize a `CompileResult` into the JSON shape the sync `compile`
/// entry returns. Shared by the callback-bridge entry below.
fn compile_result_to_json(result: rsvelte_core::compiler::CompileResult) -> Value {
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
    serde_json::json!({
        "js": js_obj,
        "css": css_obj,
        "warnings": warnings_to_json(&result.warnings),
        "metadata": { "runes": result.metadata.runes },
        "ast": Value::Null,
    })
}

/// Compile a Svelte component with a dynamic `cssHash` callback.
///
/// A `cssHash` function depends on the component's CSS, so it can't be
/// pre-resolved at the JS boundary like `customElement`/`css`/`runes`.
/// This async entry bridges the JS callback into the compiler through a
/// `ThreadsafeFunction`: the compile runs under `block_in_place` on a
/// libuv worker so the JS thread stays free to service the callback,
/// which the bridge awaits with `block_on`. Callers that don't pass a
/// `cssHash` function keep using the sync `compile` path — this entry
/// adds no overhead there.
#[napi(js_name = "compileWithCssHash")]
pub async fn napi_compile_with_css_hash(
    source: String,
    options: Option<NapiCompileOptions>,
    #[napi(
        ts_arg_type = "(name: string, filename: string, css: string) => Promise<string | null>"
    )]
    css_hash: css_hash_bridge::JsCssHashCb,
) -> napi::Result<Value> {
    let mut opts = options_to_compile(options);
    let handle: css_hash_bridge::Handle =
        std::sync::Arc::new(std::sync::RwLock::new(Some(css_hash)));
    opts.css_hash = Some(css_hash_bridge::build(std::sync::Arc::clone(&handle)));

    let result = napi::tokio::task::block_in_place(|| rust_compile(&source, opts));

    // Drop the TSFN while V8 handles are still valid (see oxfmt's cleanup note).
    let _ = handle.write().unwrap().take();

    match result {
        Ok(r) => Ok(compile_result_to_json(r)),
        Err(e) => Err(napi::Error::from_reason(format!("{e:?}"))),
    }
}

mod css_hash_bridge {
    use napi::Status;
    use napi::bindgen_prelude::{FnArgs, Promise, block_on};
    use napi::threadsafe_function::ThreadsafeFunction;
    use rsvelte_core::compiler::{CssHashFn, CssHashInput};
    use std::sync::{Arc, RwLock};

    // (name, filename, css) in; the sorted scope-class string (or null) out.
    // `CalleeHandled = false` so the callback receives the args directly.
    pub(super) type JsCssHashCb = ThreadsafeFunction<
        FnArgs<(String, String, String)>,
        Promise<Option<String>>,
        FnArgs<(String, String, String)>,
        Status,
        false,
    >;

    pub(super) type Handle = Arc<RwLock<Option<JsCssHashCb>>>;

    pub(super) fn build(handle: Handle) -> CssHashFn {
        Arc::new(move |input: &CssHashInput| -> String {
            let guard = handle.read().unwrap();
            let Some(cb) = guard.as_ref() else {
                return default_hash(&input.css);
            };
            let args = FnArgs::from((
                input.name.clone(),
                input.filename.clone(),
                input.css.clone(),
            ));
            let hashed = block_on(async {
                match cb.call_async(args).await {
                    Ok(promise) => promise.await.ok().flatten(),
                    Err(_) => None,
                }
            });
            drop(guard);
            // JS never rejects (it resolves `null` on error); fall back to the
            // compiler's default `svelte-<hash(css)>` on a null / internal failure.
            hashed.unwrap_or_else(|| default_hash(&input.css))
        })
    }

    fn default_hash(css: &str) -> String {
        rsvelte_core::compiler::phases::phase3_transform::css::generate_css_hash(css)
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

// Each scalar option is decoded straight from its JS value rather than through
// `serde_json`, whose number conversion aborts on non-finite input (`NaN`,
// `Infinity`) before any coercion runs. Objects, arrays, functions and other
// non-scalars collapse to `Other`, so no input type can surface a raw
// "Failed to convert napi value" error; a wrong-typed option instead reports
// the same message the upstream `validate-options.js` prints. `undefined`,
// absent keys and `null` all become `None` via the `#[napi(object)]` `Option`
// guard, leaving the option at its default.
pub enum LenientScalar {
    Bool(bool),
    Number(f64),
    Str(String),
    // A plain (non-array) object, keyed by property name. Direct children are
    // decoded one level deep (so `{ async: NaN }` reads `async` as `Number`
    // rather than aborting like `serde_json`), but a grandchild object collapses
    // to `Other` instead of recursing — that depth cap is what makes a
    // self-referential object safe to decode. `undefined` children are dropped
    // (unset); everything the consumers read lives at depth 1.
    Object(Vec<(String, LenientScalar)>),
    // Arrays, functions, symbols and other non-scalars — JS-truthy, but not a
    // value any option can consume.
    Other,
}

impl LenientScalar {
    fn is_object(&self) -> bool {
        matches!(self, LenientScalar::Object(_))
    }

    fn field(&self, key: &str) -> Option<&LenientScalar> {
        match self {
            LenientScalar::Object(fields) => fields.iter().find(|(k, _)| k == key).map(|(_, v)| v),
            _ => None,
        }
    }
}

impl napi::bindgen_prelude::TypeName for LenientScalar {
    fn type_name() -> &'static str {
        "unknown"
    }
    fn value_type() -> napi::ValueType {
        napi::ValueType::Unknown
    }
}

// Decode a JS value as a scalar; objects, arrays, functions and every other
// non-scalar become `Other` with no recursion, so this can never chase a cyclic
// reference. Used for an object's direct children, capping the decode at depth 1.
unsafe fn decode_scalar(
    env: napi::sys::napi_env,
    napi_val: napi::sys::napi_value,
) -> napi::Result<LenientScalar> {
    use napi::bindgen_prelude::FromNapiValue;
    let mut val_type = 0;
    // SAFETY: `env`/`napi_val` are valid handles from Node-API; `napi_typeof`
    // only reads them and writes the type tag.
    let status = unsafe { napi::sys::napi_typeof(env, napi_val, &mut val_type) };
    if status != napi::sys::Status::napi_ok {
        return Err(napi::Error::from_status(napi::Status::from(status)));
    }
    // SAFETY: each arm reads the confirmed JS type; the numeric path uses
    // `napi_get_value_double`, which tolerates non-finite values.
    unsafe {
        Ok(match val_type {
            napi::sys::ValueType::napi_boolean => {
                LenientScalar::Bool(bool::from_napi_value(env, napi_val)?)
            }
            napi::sys::ValueType::napi_number => {
                LenientScalar::Number(f64::from_napi_value(env, napi_val)?)
            }
            napi::sys::ValueType::napi_string => {
                LenientScalar::Str(String::from_napi_value(env, napi_val)?)
            }
            _ => LenientScalar::Other,
        })
    }
}

// Single-level view used only for an object's direct children: its decoder
// never recurses into further objects, which is what bounds `LenientScalar`
// decoding at depth 1 and makes a cyclic object graph unreachable.
struct ScalarLeaf(LenientScalar);

impl napi::bindgen_prelude::FromNapiValue for ScalarLeaf {
    unsafe fn from_napi_value(
        env: napi::sys::napi_env,
        napi_val: napi::sys::napi_value,
    ) -> napi::Result<Self> {
        // SAFETY: valid handles from Node-API, forwarded to the scalar decoder.
        Ok(ScalarLeaf(unsafe { decode_scalar(env, napi_val)? }))
    }
}

impl napi::bindgen_prelude::FromNapiValue for LenientScalar {
    unsafe fn from_napi_value(
        env: napi::sys::napi_env,
        napi_val: napi::sys::napi_value,
    ) -> napi::Result<Self> {
        let mut val_type = 0;
        // SAFETY: `env`/`napi_val` are the valid handles Node-API passed in;
        // `napi_typeof` only reads them and writes the type tag.
        let status = unsafe { napi::sys::napi_typeof(env, napi_val, &mut val_type) };
        if status != napi::sys::Status::napi_ok {
            return Err(napi::Error::from_status(napi::Status::from(status)));
        }
        if val_type != napi::sys::ValueType::napi_object {
            // SAFETY: valid handles; non-object values are decoded directly.
            return unsafe { decode_scalar(env, napi_val) };
        }
        let mut is_array = false;
        // SAFETY: valid handles; `napi_is_array` only reads them and writes the flag.
        let st = unsafe { napi::sys::napi_is_array(env, napi_val, &mut is_array) };
        if st != napi::sys::Status::napi_ok {
            return Err(napi::Error::from_status(napi::Status::from(st)));
        }
        if is_array {
            return Ok(LenientScalar::Other);
        }
        // SAFETY: confirmed non-array object; properties are read through the
        // safe `Object` API, and each child is decoded via `ScalarLeaf`, which
        // does not recurse — so no cycle can drive an unbounded decode.
        let obj = unsafe { napi::bindgen_prelude::Object::from_napi_value(env, napi_val)? };
        let mut fields = Vec::new();
        for key in napi::bindgen_prelude::Object::keys(&obj)? {
            if let Some(ScalarLeaf(v)) = obj.get::<ScalarLeaf>(&key)? {
                fields.push((key, v));
            }
        }
        Ok(LenientScalar::Object(fields))
    }
}

impl napi::bindgen_prelude::ToNapiValue for LenientScalar {
    unsafe fn to_napi_value(
        env: napi::sys::napi_env,
        val: Self,
    ) -> napi::Result<napi::sys::napi_value> {
        // SAFETY: `env` is the valid env Node-API passed in; each branch
        // delegates to the matching primitive's own `to_napi_value`. Input-only
        // in practice — this exists so `#[napi(object)]` structs holding the
        // type satisfy the derived `ToNapiValue` bound.
        unsafe {
            match val {
                LenientScalar::Bool(b) => bool::to_napi_value(env, b),
                LenientScalar::Number(n) => f64::to_napi_value(env, n),
                LenientScalar::Str(s) => String::to_napi_value(env, s),
                LenientScalar::Object(_) | LenientScalar::Other => {
                    napi::bindgen_prelude::Null::to_napi_value(env, napi::bindgen_prelude::Null)
                }
            }
        }
    }
}

fn invalid_option(detail: impl std::fmt::Display) -> napi::Error {
    napi::Error::from_reason(format!("Invalid compiler option: {detail}"))
}

fn coerce_bool(keypath: &str, v: &LenientScalar) -> napi::Result<bool> {
    match v {
        LenientScalar::Bool(b) => Ok(*b),
        _ => Err(invalid_option(format!(
            "{keypath} should be true or false, if specified"
        ))),
    }
}

fn coerce_string(keypath: &str, v: &LenientScalar) -> napi::Result<String> {
    match v {
        LenientScalar::Str(s) => Ok(s.clone()),
        _ => Err(invalid_option(format!(
            "{keypath} should be a string, if specified"
        ))),
    }
}

// `runes` mirrors upstream's `parametric` validator, which never rejects a
// value. Only a real `false` becomes `Some(false)`: `Option<bool>` can't encode
// the other falsy values (`0`/`""`/`NaN`, none of which upstream compares
// `=== false`), so those — and non-scalars like `null` or the uninvokable
// `(opts) => boolean` form — auto-detect (`None`) rather than risk misfiring the
// strict `runes === false` paths a spurious `Some(false)` would trigger.
fn coerce_runes(v: &LenientScalar) -> Option<bool> {
    match v {
        LenientScalar::Bool(b) => Some(*b),
        LenientScalar::Number(n) if *n != 0.0 && !n.is_nan() => Some(true),
        LenientScalar::Str(s) if !s.is_empty() => Some(true),
        _ => None,
    }
}

fn coerce_generate(v: &LenientScalar) -> napi::Result<GenerateMode> {
    let msg = "generate must be \"client\", \"server\" or false";
    match v {
        LenientScalar::Bool(false) => Ok(GenerateMode::None),
        // `dom`/`ssr` are the pre-Svelte-5 spellings of `client`/`server`.
        LenientScalar::Str(s) => match s.as_str() {
            "client" | "dom" => Ok(GenerateMode::Client),
            "server" | "ssr" => Ok(GenerateMode::Server),
            "false" => Ok(GenerateMode::None),
            _ => Err(invalid_option(msg)),
        },
        _ => Err(invalid_option(msg)),
    }
}

fn coerce_namespace(v: &LenientScalar) -> napi::Result<Namespace> {
    let msg = "namespace should be one of \"html\", \"mathml\" or \"svg\"";
    match v {
        LenientScalar::Str(s) => match s.as_str() {
            "html" => Ok(Namespace::Html),
            "svg" => Ok(Namespace::Svg),
            "mathml" => Ok(Namespace::Mathml),
            _ => Err(invalid_option(msg)),
        },
        _ => Err(invalid_option(msg)),
    }
}

fn coerce_css(v: &LenientScalar) -> napi::Result<CssMode> {
    match v {
        LenientScalar::Bool(_) => Err(invalid_option(
            "The boolean options have been removed from the css option. Use \"external\" instead of false and \"injected\" instead of true",
        )),
        LenientScalar::Str(s) => match s.as_str() {
            "external" => Ok(CssMode::External),
            "injected" => Ok(CssMode::Injected),
            _ => Err(invalid_option(
                "css should be either \"external\" (default, recommended) or \"injected\"",
            )),
        },
        _ => Err(invalid_option(
            "css should be either \"external\" (default, recommended) or \"injected\"",
        )),
    }
}

fn coerce_fragments(v: &LenientScalar) -> napi::Result<rsvelte_core::compiler::FragmentMode> {
    let msg = "fragments should be either \"html\" or \"tree\"";
    match v {
        LenientScalar::Str(s) => match s.as_str() {
            "html" => Ok(rsvelte_core::compiler::FragmentMode::Html),
            "tree" => Ok(rsvelte_core::compiler::FragmentMode::Tree),
            _ => Err(invalid_option(msg)),
        },
        _ => Err(invalid_option(msg)),
    }
}

// Upstream `list([4, 5], 5)` accepts only the numbers 4 and 5 (the string
// `"4"` is rejected).
fn coerce_component_api(v: &LenientScalar) -> napi::Result<rsvelte_core::compiler::ComponentApi> {
    match v {
        LenientScalar::Number(n) if *n == 4.0 => Ok(rsvelte_core::compiler::ComponentApi::V4),
        LenientScalar::Number(n) if *n == 5.0 => Ok(rsvelte_core::compiler::ComponentApi::V5),
        _ => Err(invalid_option(
            "compatibility.componentApi should be either \"4\" or \"5\"",
        )),
    }
}

// Upstream `experimental: object({ async: boolean(false) })`: a non-object is
// rejected; a missing/`null`/`undefined` `async` keeps the default.
fn coerce_experimental(v: &LenientScalar) -> napi::Result<ExperimentalOptions> {
    if !v.is_object() {
        return Err(invalid_option("experimental should be an object"));
    }
    let mut exp = ExperimentalOptions::default();
    if let Some(a) = v.field("async") {
        exp.r#async = coerce_bool("experimental.async", a)?;
    }
    Ok(exp)
}

fn coerce_compatibility(v: &LenientScalar) -> napi::Result<rsvelte_core::compiler::ComponentApi> {
    if !v.is_object() {
        return Err(invalid_option("compatibility should be an object"));
    }
    match v.field("componentApi") {
        None => Ok(rsvelte_core::compiler::ComponentApi::default()),
        Some(c) => coerce_component_api(c),
    }
}

/// Typed mirror of `CompileOptions` for the NAPI boundary. Field
/// names follow `#[napi(object)]`'s automatic camelCase conversion,
/// so the JS shape stays identical to the legacy `Value`-typed
/// `options` argument (`{ dev, generate, filename, rootDir, … }`).
#[napi(object)]
pub struct NapiCompileOptions {
    pub dev: Option<LenientScalar>,
    pub generate: Option<LenientScalar>,
    pub filename: Option<LenientScalar>,
    pub root_dir: Option<LenientScalar>,
    pub name: Option<LenientScalar>,
    pub custom_element: Option<LenientScalar>,
    pub accessors: Option<LenientScalar>,
    pub namespace: Option<LenientScalar>,
    pub immutable: Option<LenientScalar>,
    pub css: Option<LenientScalar>,
    pub preserve_comments: Option<LenientScalar>,
    pub preserve_whitespace: Option<LenientScalar>,
    pub runes: Option<LenientScalar>,
    pub disclose_version: Option<LenientScalar>,
    /// SourceMap v3 object **or** its serialized JSON string — both
    /// accepted. Preprocessors pass an object; the test harness
    /// sometimes passes a string. Anything else (number, array,
    /// boolean) is ignored.
    pub sourcemap: Option<Value>,
    pub output_filename: Option<LenientScalar>,
    pub css_output_filename: Option<LenientScalar>,
    pub hmr: Option<LenientScalar>,
    pub modern_ast: Option<LenientScalar>,
    pub experimental: Option<LenientScalar>,
    pub compatibility: Option<LenientScalar>,
    /// Pre-computed deterministic hash for the test harness (the JS
    /// `cssHash` callback can't be called from Rust).
    pub css_hash_override: Option<String>,
    pub fragments: Option<LenientScalar>,
}

impl NapiCompileOptions {
    /// Convert into the compiler's native `CompileOptions`, mirroring the
    /// upstream `validate-options.js`: an absent field keeps its default and a
    /// wrong JS type is rejected with the upstream message.
    fn into_compile_options(self) -> napi::Result<CompileOptions> {
        let mut opts = CompileOptions::default();
        if let Some(v) = &self.dev {
            opts.dev = coerce_bool("dev", v)?;
        }
        if let Some(v) = &self.generate {
            opts.generate = coerce_generate(v)?;
        }
        if let Some(v) = &self.filename {
            opts.filename = Some(coerce_string("filename", v)?);
        }
        // rootDir defaults to the process's cwd (matches official Svelte).
        if let Some(v) = &self.root_dir {
            opts.root_dir = Some(coerce_string("rootDir", v)?);
        } else if let Ok(cwd) = std::env::current_dir() {
            opts.root_dir = Some(cwd.to_string_lossy().to_string());
        }
        if let Some(v) = &self.name {
            opts.name = Some(coerce_string("name", v)?);
        }
        if let Some(v) = &self.custom_element {
            opts.custom_element = coerce_bool("customElement", v)?;
        }
        if let Some(v) = &self.accessors {
            opts.accessors = coerce_bool("accessors", v)?;
        }
        if let Some(v) = &self.namespace {
            opts.namespace = coerce_namespace(v)?;
        }
        if let Some(v) = &self.immutable {
            opts.immutable = coerce_bool("immutable", v)?;
        }
        if let Some(v) = &self.css {
            opts.css = coerce_css(v)?;
        }
        if let Some(v) = &self.preserve_comments {
            opts.preserve_comments = coerce_bool("preserveComments", v)?;
        }
        if let Some(v) = &self.preserve_whitespace {
            opts.preserve_whitespace = coerce_bool("preserveWhitespace", v)?;
        }
        if let Some(v) = &self.runes {
            opts.runes = coerce_runes(v);
        }
        if let Some(v) = &self.disclose_version {
            opts.disclose_version = coerce_bool("discloseVersion", v)?;
        }
        if let Some(v) = self.sourcemap {
            // Preprocessors pass the map as an object; the test harness
            // and some callers pass it as the serialized JSON string.
            // Accept either; ignore anything else.
            if let Some(s) = v.as_str() {
                opts.sourcemap = Some(s.to_string());
            } else if v.is_object() || v.is_array() {
                // Only carry the map through when it serializes; on failure
                // `.ok()` yields `None`, leaving the field unset rather than
                // storing an empty-string sourcemap.
                opts.sourcemap = serde_json::to_string(&v).ok();
            }
        }
        if let Some(v) = &self.output_filename {
            opts.output_filename = Some(coerce_string("outputFilename", v)?);
        }
        if let Some(v) = &self.css_output_filename {
            opts.css_output_filename = Some(coerce_string("cssOutputFilename", v)?);
        }
        if let Some(v) = &self.hmr {
            opts.hmr = coerce_bool("hmr", v)?;
        }
        if let Some(v) = &self.modern_ast {
            opts.modern_ast = coerce_bool("modernAst", v)?;
        }
        if let Some(v) = &self.experimental {
            opts.experimental = coerce_experimental(v)?;
        }
        if let Some(v) = &self.compatibility {
            opts.compatibility.component_api = coerce_compatibility(v)?;
        }
        if let Some(hash_override) = self.css_hash_override {
            opts.css_hash = Some(std::sync::Arc::new(
                move |_: &rsvelte_core::compiler::CssHashInput| hash_override.clone(),
            ));
        }
        if let Some(v) = &self.fragments {
            opts.fragments = coerce_fragments(v)?;
        }
        Ok(opts)
    }
}

/// Typed mirror of `ModuleCompileOptions`.
#[napi(object)]
pub struct NapiModuleCompileOptions {
    pub dev: Option<LenientScalar>,
    pub generate: Option<LenientScalar>,
    pub filename: Option<LenientScalar>,
    pub root_dir: Option<LenientScalar>,
    pub experimental: Option<LenientScalar>,
}

impl NapiModuleCompileOptions {
    fn into_module_compile_options(self) -> napi::Result<ModuleCompileOptions> {
        let mut opts = ModuleCompileOptions::default();
        if let Some(v) = &self.dev {
            opts.dev = coerce_bool("dev", v)?;
        }
        if let Some(v) = &self.generate {
            opts.generate = coerce_generate(v)?;
        }
        if let Some(v) = &self.filename {
            opts.filename = Some(coerce_string("filename", v)?);
        }
        if let Some(v) = &self.root_dir {
            opts.root_dir = Some(coerce_string("rootDir", v)?);
        }
        if let Some(v) = &self.experimental {
            opts.experimental = coerce_experimental(v)?;
        }
        Ok(opts)
    }
}

/// Compatibility wrapper: convert an Option<NapiCompileOptions> (the
/// typed surface) into `CompileOptions`. `None` and `Some(empty)`
/// both produce the defaults.
fn options_to_compile(opts: Option<NapiCompileOptions>) -> napi::Result<CompileOptions> {
    match opts {
        Some(o) => o.into_compile_options(),
        None => {
            let mut o = CompileOptions::default();
            if let Ok(cwd) = std::env::current_dir() {
                o.root_dir = Some(cwd.to_string_lossy().to_string());
            }
            Ok(o)
        }
    }
}

fn options_to_module_compile(
    opts: Option<NapiModuleCompileOptions>,
) -> napi::Result<ModuleCompileOptions> {
    match opts {
        Some(o) => o.into_module_compile_options(),
        None => Ok(ModuleCompileOptions::default()),
    }
}

/// Compile a Svelte module (.svelte.js/.svelte.ts).
#[napi(js_name = "compileModule")]
pub fn napi_compile_module(
    source: String,
    options: Option<NapiModuleCompileOptions>,
) -> napi::Result<Value> {
    let opts = options_to_module_compile(options)?;
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

use rsvelte_core::vps::{ResolveOptions, hmr_diff as rust_hmr_diff, resolve_id as rust_resolve_id};

/// Diff two `.svelte` source versions. Returns `{ change, instanceChanged,
/// moduleChanged }` so the JS shim can decide between Vite's hot-update
/// patch and a full reload. Mirrors the JS reference's
/// `vite-plugin-svelte/src/plugins/hot-update.js`.
#[napi(js_name = "hmrDiff")]
pub fn napi_hmr_diff(prev: String, curr: String) -> napi::Result<Value> {
    let diff = rust_hmr_diff(&prev, &curr);
    let kind = match diff.change {
        rsvelte_core::vps::HmrChange::HotUpdate => "hot-update",
        rsvelte_core::vps::HmrChange::FullReload => "full-reload",
        rsvelte_core::vps::HmrChange::Unchanged => "unchanged",
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
    pub filename: Option<LenientScalar>,
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
    let filename = match options.as_ref().and_then(|o| o.filename.as_ref()) {
        Some(v) => Some(coerce_string("filename", v)?),
        None => None,
    };

    env.execute_tokio_future(
        async move {
            rsvelte_core::compiler::preprocess::preprocess(source, rust_groups, filename)
                .await
                .map_err(|e| napi::Error::from_reason(format!("{e}")))
        },
        |_env, processed| Ok(preprocess_bridge::processed_to_json(processed)),
    )
}

mod preprocess_bridge {
    use napi::Status;
    use napi::bindgen_prelude::{FromNapiValue, Object, Promise};
    use napi::threadsafe_function::ThreadsafeFunction;
    use rsvelte_core::compiler::preprocess::types::{
        AttributeValue as RsAttrValue, MarkupPreprocessorFn, MarkupPreprocessorOptions,
        PreprocessError, PreprocessorFn, PreprocessorGroup, PreprocessorOptions,
        PreprocessorResult, Processed, SimpleDecodedMap, SourceMapInput,
    };
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
            // SAFETY: `env`/`napi_val` are the valid handles passed by Node-API to
            // `from_napi_value`; `napi_is_promise` only reads them and writes the bool.
            let status = unsafe { napi::sys::napi_is_promise(env, napi_val, &mut is_promise) };
            if status != napi::sys::Status::napi_ok {
                return Err(napi::Error::from_status(napi::Status::from(status)));
            }
            if is_promise {
                // SAFETY: same valid `env`/`napi_val`; we just confirmed it is a Promise.
                let p = unsafe { Promise::<T>::from_napi_value(env, napi_val)? };
                Ok(MaybePromise::Promise(p))
            } else {
                // SAFETY: same valid `env`/`napi_val`; delegating to `T`'s own decoder.
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
    let opts = options_to_compile(options)?;
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
    let opts = options_to_module_compile(options)?;

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

fn warning_to_napi(w: rsvelte_core::compiler::Warning) -> NapiWarning {
    NapiWarning {
        code: w.code,
        message: w.message,
        filename: w.filename,
        start: w.start.map(position_to_napi),
        end: w.end.map(position_to_napi),
        frame: w.frame,
    }
}

fn position_to_napi(p: rsvelte_core::compiler::Position) -> NapiPosition {
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
// fixed-layout byte buffer (`rsvelte_core::napi_raw`) and hands it to V8 as
// a single `Buffer`. The JS shim's `decodeEnvelope` slices fields
// out on demand — no `serde_json` on the boundary, no V8 object tree
// construction for the warning array unless the caller actually
// reads `.warnings`.
//
// Step 3 (further down) layers bumpalo allocation on top of this
// same envelope: the buffer becomes a view into arena memory rather
// than an owned `Vec<u8>`.

/// Reject an envelope whose total size would overflow the `u32` header
/// offsets (only reachable for more than 4 GiB of generated output).
/// Surfaces the overflow as a `napi::Error` instead of letting `encode_*`
/// silently truncate the offsets and hand the JS decoder a corrupt
/// buffer (M-012).
#[inline]
fn ensure_envelope_size(size: usize) -> napi::Result<()> {
    rsvelte_core::napi_raw::check_envelope_size(size).map_err(|size| {
        napi::Error::from_reason(format!(
            "rsvelte: compiled output is {size} bytes, exceeding the \
             {max}-byte envelope limit (header offsets are u32)",
            max = rsvelte_core::napi_raw::MAX_ENVELOPE_SIZE
        ))
    })
}

/// `compile()` returning a single packed envelope buffer.
/// See `rsvelte_core::napi_raw` for the byte-level format.
#[napi(js_name = "compileEnvelope")]
pub fn napi_compile_envelope(
    source: String,
    options: Option<NapiCompileOptions>,
) -> napi::Result<Buffer> {
    let opts = options_to_compile(options)?;
    match rust_compile(&source, opts) {
        Ok(result) => {
            ensure_envelope_size(rsvelte_core::napi_raw::estimate_size(&result))?;
            Ok(Buffer::from(rsvelte_core::napi_raw::encode_to_vec(&result)))
        }
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
//      starts living in a Bump, the same
//      `create_buffer_with_borrowed_data` path generalises to
//      "pass any arena byte range to JS without copying."
//
//   2. **Single finalizer per compile.** Step 2 uses napi-rs's
//      per-Buffer Box<Buffer> finalizer (one drop call per buffer).
//      Step 3 collapses to one Box<Bump> drop. Negligible per call,
//      but it grows linearly with batch size.

/// Allocate `result`'s packed envelope into a fresh `bumpalo::Bump` and hand V8
/// a Buffer that borrows the arena, freeing the arena from the Buffer's
/// finalizer. Shared by both zero-copy entry points so the leak-safe ownership
/// dance (RAII guard until V8 takes ownership) lives in one place.
///
/// # Safety
///
/// A raw pointer into the bump arena is passed to napi via
/// `create_buffer_with_borrowed_data`. The arena is leaked via `Box::into_raw`
/// and only freed inside the finalizer callback, after V8 has agreed it's done
/// with the buffer. No Rust code retains the pointer after this returns.
fn create_zero_copy_envelope(
    env: &Env,
    result: &rsvelte_core::compiler::CompileResult,
) -> napi::Result<JsBuffer> {
    let size = rsvelte_core::napi_raw::estimate_size(result);
    ensure_envelope_size(size)?;
    let bump = Box::new(bumpalo::Bump::with_capacity(size));
    let bump_ptr: *mut bumpalo::Bump = Box::into_raw(bump);

    // RAII guard: if we return early (e.g. `create_buffer_with_borrowed_data`
    // errors) or unwind before ownership is handed to V8's finalizer, free the
    // leaked arena instead of abandoning it (H-015). On success we disarm it so
    // only the finalizer frees the arena.
    struct BumpGuard(*mut bumpalo::Bump);
    impl Drop for BumpGuard {
        fn drop(&mut self) {
            if !self.0.is_null() {
                // SAFETY: the pointer came from `Box::into_raw`, has not been
                // handed to the finalizer, and is not aliased.
                unsafe { drop(Box::from_raw(self.0)) };
            }
        }
    }
    let mut guard = BumpGuard(bump_ptr);

    // SAFETY: bump_ptr is freshly leaked from Box::into_raw and not
    // aliased; we re-acquire ownership via Box::from_raw inside the
    // finalizer below.
    let bump_ref: &bumpalo::Bump = unsafe { &*bump_ptr };
    let slice = rsvelte_core::napi_raw::encode_into_bump(bump_ref, result);
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
    // The finalizer now owns the arena; disarm the guard so it doesn't
    // double-free.
    guard.0 = std::ptr::null_mut();
    Ok(js_buf_value.into_raw())
}

/// Zero-copy variant of {@link napi_compile_envelope}. Allocates the
/// envelope bytes inside a `bumpalo::Bump`, hands V8 a Buffer view
/// over the arena, and drops the arena from a finalizer when V8
/// finalises the Buffer.
#[napi(js_name = "compileEnvelopeZeroCopy")]
pub fn napi_compile_envelope_zero_copy(
    env: Env,
    source: String,
    options: Option<NapiCompileOptions>,
) -> napi::Result<JsBuffer> {
    let opts = options_to_compile(options)?;
    let result = match rust_compile(&source, opts) {
        Ok(r) => r,
        Err(e) => return Err(napi::Error::from_reason(format!("{e:?}"))),
    };
    create_zero_copy_envelope(&env, &result)
}

/// `compileModule` counterpart of `compileEnvelopeZeroCopy`.
#[napi(js_name = "compileModuleEnvelopeZeroCopy")]
pub fn napi_compile_module_envelope_zero_copy(
    env: Env,
    source: String,
    options: Option<NapiModuleCompileOptions>,
) -> napi::Result<JsBuffer> {
    let opts = options_to_module_compile(options)?;
    let result = match rust_compile_module(&source, opts) {
        Ok(r) => r,
        Err(e) => return Err(napi::Error::from_reason(format!("{e:?}"))),
    };
    let cr = rsvelte_core::compiler::CompileResult {
        js: result.js,
        css: None,
        warnings: Vec::new(),
        metadata: rsvelte_core::compiler::CompileMetadata { runes: true },
        ast: None,
    };
    create_zero_copy_envelope(&env, &cr)
}

/// `compileModule()` returning the same packed envelope. The envelope
/// uses the empty-CSS / empty-warnings encoding, so the JS decoder is
/// identical for both entry points.
#[napi(js_name = "compileModuleEnvelope")]
pub fn napi_compile_module_envelope(
    source: String,
    options: Option<NapiModuleCompileOptions>,
) -> napi::Result<Buffer> {
    let opts = options_to_module_compile(options)?;
    match rust_compile_module(&source, opts) {
        Ok(result) => {
            // Adapt the module result into the same `CompileResult` shape
            // the envelope encoder expects. Module compiles never produce
            // CSS or warnings, and runes mode is always on, so the
            // resulting envelope is the minimal js-only form.
            let cr = rsvelte_core::compiler::CompileResult {
                js: result.js,
                css: None,
                warnings: Vec::new(),
                metadata: rsvelte_core::compiler::CompileMetadata { runes: true },
                ast: None,
            };
            ensure_envelope_size(rsvelte_core::napi_raw::estimate_size(&cr))?;
            Ok(Buffer::from(rsvelte_core::napi_raw::encode_to_vec(&cr)))
        }
        Err(e) => Err(napi::Error::from_reason(format!("{e:?}"))),
    }
}

// =============================================================================
// Batch compile: one NAPI call → N files in parallel → one Buffer
// =============================================================================
//
// `compileBatch([{source, options}, …])` hands the whole worklist to
// `rsvelte_core::compiler::compile_batch`, which uses rayon to compile in
// parallel, and packs the resulting `Result<CompileResult, _>`s into
// one batch envelope (`rsvelte_core::napi_raw::encode_batch_to_vec`). One
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
    let parsed: Vec<(String, rsvelte_core::compiler::CompileOptions)> = inputs
        .into_iter()
        .map(|item| Ok((item.source, options_to_compile(item.options)?)))
        .collect::<napi::Result<_>>()?;

    // Compile in parallel. `compile_batch` takes `&[(&str, CompileOptions)]`,
    // so we materialise the borrowed view once.
    let borrowed: Vec<(&str, rsvelte_core::compiler::CompileOptions)> = parsed
        .iter()
        .map(|(s, o)| (s.as_str(), o.clone()))
        .collect();
    let results = rsvelte_core::compiler::compile_batch(&borrowed);

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

    let entries: Vec<rsvelte_core::napi_raw::BatchEntry<'_>> = results
        .iter()
        .zip(err_strings.iter())
        .map(|(r, e)| match r {
            Ok(cr) => rsvelte_core::napi_raw::BatchEntry::Ok(cr),
            Err(_) => {
                rsvelte_core::napi_raw::BatchEntry::Err(e.as_deref().unwrap_or("unknown error"))
            }
        })
        .collect();

    ensure_envelope_size(rsvelte_core::napi_raw::estimate_batch_size(&entries))?;
    Ok(Buffer::from(rsvelte_core::napi_raw::encode_batch_to_vec(
        &entries,
    )))
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
        ensure_envelope_size(rsvelte_core::napi_raw::estimate_size(&result))?;
        Ok(rsvelte_core::napi_raw::encode_to_vec(&result))
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
) -> napi::Result<AsyncTask<CompileEnvelopeTask>> {
    Ok(AsyncTask::new(CompileEnvelopeTask {
        source,
        options: options_to_compile(options)?,
    }))
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
        let results = rsvelte_core::compiler::compile_batch(&borrowed);
        let err_strings: Vec<Option<String>> = results
            .iter()
            .map(|r| match r {
                Ok(_) => None,
                Err(e) => Some(format!("{e:?}")),
            })
            .collect();
        let entries: Vec<rsvelte_core::napi_raw::BatchEntry<'_>> = results
            .iter()
            .zip(err_strings.iter())
            .map(|(r, e)| match r {
                Ok(cr) => rsvelte_core::napi_raw::BatchEntry::Ok(cr),
                Err(_) => {
                    rsvelte_core::napi_raw::BatchEntry::Err(e.as_deref().unwrap_or("unknown error"))
                }
            })
            .collect();
        ensure_envelope_size(rsvelte_core::napi_raw::estimate_batch_size(&entries))?;
        Ok(rsvelte_core::napi_raw::encode_batch_to_vec(&entries))
    }

    fn resolve(&mut self, _env: napi::Env, output: Self::Output) -> napi::Result<Self::JsValue> {
        Ok(Buffer::from(output))
    }
}

#[napi(js_name = "compileBatchAsync")]
pub fn napi_compile_batch_async(
    inputs: Vec<CompileBatchInput>,
) -> napi::Result<AsyncTask<CompileBatchTask>> {
    let parsed: Vec<(String, CompileOptions)> = inputs
        .into_iter()
        .map(|item| Ok((item.source, options_to_compile(item.options)?)))
        .collect::<napi::Result<_>>()?;
    Ok(AsyncTask::new(CompileBatchTask { inputs: parsed }))
}
