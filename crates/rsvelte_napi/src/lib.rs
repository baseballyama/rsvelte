//! N-API bindings for the Svelte compiler.
//!
//! This module provides Node.js native addon bindings via napi-rs,
//! allowing the Rust Svelte compiler to be used from JavaScript/TypeScript.
//!
//! `catch_unwind` on every `#[napi]` export is load-bearing, not decorative:
//! napi-rs only wraps a function body in `std::panic::catch_unwind` when this
//! flag is present (see `napi-derive-backend`'s `codegen/fn.rs`). Without it a
//! panic unwinds straight across the generated `extern "C"` boundary — which,
//! under the `dist-napi` profile's `panic = "unwind"`, aborts the entire Node
//! process (a Vite dev server, a build, a svelte-check run, ...) rather than
//! surfacing as a per-call error. With it, a panic in `compile()` or any other
//! entry point becomes a thrown JS error the caller can handle, so one
//! pathological `.svelte` file cannot take down the whole process.

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
use napi::{Env, JsBuffer, JsValue};
use napi_derive::napi;
use serde_json::Value;

use rsvelte_core::compiler::{
    CompileOptions, CssMode, ExperimentalOptions, GenerateMode, ModuleCompileOptions, Namespace,
    compile as rust_compile, compile_both as rust_compile_both,
    compile_module as rust_compile_module,
    compile_with_external_sourcemap_content as rust_compile_with_external_sourcemap_content,
};
use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx as rust_svelte2tsx};

#[napi(object)]
pub struct NapiBuildInfo {
    pub commit: String,
    pub dirty: bool,
}

/// Build provenance embedded by `build.rs`, used to attest staged addons.
#[napi(js_name = "buildInfo", catch_unwind)]
pub fn napi_build_info() -> NapiBuildInfo {
    NapiBuildInfo {
        commit: env!("RSVELTE_NAPI_BUILD_COMMIT").to_owned(),
        dirty: env!("RSVELTE_NAPI_BUILD_DIRTY") == "true",
    }
}

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
    /// Return the modern AST. Upstream's `parse()` defaults this to `false` in
    /// Svelte 5, so an omitted `modern` returns the **legacy** AST.
    pub modern: Option<LenientScalar>,
    /// Keep parsing past a recoverable error and return an AST anyway. Mirrors
    /// upstream's `loose`, which an editor integration uses to parse a document
    /// mid-keystroke.
    pub loose: Option<LenientScalar>,
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
        // Upstream's `parse()` validates none of its options, so there is no
        // upstream diagnostic to carry and the message alone is the whole one.
        field
            .map_or_else(|| Ok(false), |value| coerce_bool(keypath, value))
            .map_err(|e| napi::Error::from_reason(e.message))
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
///
/// # Errors
///
/// Returns an error when parsing, option validation, or serialization fails.
#[allow(
    clippy::needless_pass_by_value,
    reason = "napi-rs owns JavaScript arguments at the exported ABI boundary"
)]
#[napi(js_name = "parse", catch_unwind)]
pub fn napi_parse(source: String, options: Option<NapiParseOptions>) -> napi::Result<String> {
    use rsvelte_core::compiler::phases::phase1_parse::{
        ParseOptions, parse as rust_parse, remove_bom,
    };

    // Upstream strips it before the parser (and before the locator), so every
    // position below has to be relative to the trimmed source too.
    let source = remove_bom(&source);

    if options
        .as_ref()
        .and_then(|options| options.skip_css_ast.as_ref())
        .is_some()
    {
        return Err(napi::Error::from_reason(
            "skipCssAst is only supported by parseEnvelope",
        ));
    }

    // Upstream's `parse()` reads exactly these two (`compiler/index.js`):
    // `loose` goes to the parser, `modern` selects the output shape afterwards,
    // which is why it is not a `ParseOptions` field here either.
    let modern =
        NapiParseOptions::flag(options.as_ref().and_then(|o| o.modern.as_ref()), "modern")?;
    let parse_options = ParseOptions {
        skip_expression_loc: NapiParseOptions::flag(
            options
                .as_ref()
                .and_then(|o| o.skip_expression_loc.as_ref()),
            "skipExpressionLoc",
        )?,
        loose: NapiParseOptions::flag(options.as_ref().and_then(|o| o.loose.as_ref()), "loose")?,
        // The public AST API mirrors svelte/compiler `parse()`, which keeps
        // `leadingComments`/`trailingComments` on nodes.
        capture_comments: true,
        ..ParseOptions::default()
    };
    match rust_parse(source, &rsvelte_core::Allocator::default(), parse_options) {
        Ok(ast) => {
            // Spans are UTF-16 code-unit offsets to match svelte/compiler
            // (#793). ASCII source needs no remap — keep the fast path.
            let remap = |mut value: serde_json::Value| {
                if !source.is_ascii() {
                    let conv = rsvelte_core::compiler::legacy::Utf8ToUtf16::new(source);
                    rsvelte_core::compiler::legacy::convert_positions_to_utf16(&mut value, &conv);
                }
                serde_json::to_string(&value)
                    .map_err(|e| napi::Error::from_reason(format!("serialize ast: {e}")))
            };
            if modern {
                // Serialize within the AST's arena so `JsNodeId`s in the
                // Serialize impls resolve (mirrors `wasm::parse_svelte`).
                rsvelte_core::ast::arena::with_serialize_arena(&ast.arena, || {
                    if source.is_ascii() {
                        return serde_json::to_string(&ast)
                            .map_err(|e| napi::Error::from_reason(format!("serialize ast: {e}")));
                    }
                    remap(
                        serde_json::to_value(&ast)
                            .map_err(|e| napi::Error::from_reason(format!("serialize ast: {e}")))?,
                    )
                })
            } else {
                // `convert_to_legacy` consumes the AST, installs the serialize
                // arena itself, and runs the UTF-16 conversion on its own output
                // — remapping it again converts every position twice.
                serde_json::to_string(&rsvelte_core::convert_to_legacy(source, ast))
                    .map_err(|e| napi::Error::from_reason(format!("serialize ast: {e}")))
            }
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
///
/// # Errors
///
/// Returns an error when parsing or option validation fails.
#[allow(
    clippy::needless_pass_by_value,
    reason = "napi-rs owns JavaScript arguments at the exported ABI boundary"
)]
#[napi(js_name = "parseEnvelope", catch_unwind)]
pub fn napi_parse_envelope(
    source: String,
    options: Option<NapiParseOptions>,
) -> napi::Result<Buffer> {
    use rsvelte_core::compiler::phases::phase1_parse::{
        ParseOptions, parse as rust_parse, remove_bom,
    };

    let source = remove_bom(&source);
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
    let ast = rust_parse(source, &rsvelte_core::Allocator::default(), parse_options)
        .map_err(|e| napi::Error::from_reason(format!("{e:?}")))?;
    // napi-rs's `Vec<u8> → Buffer` conversion is already zero-copy
    // (V8 adopts the `Vec`'s allocation); a bumpalo-backed variant
    // measured ~20% slower on representative inputs because the
    // pre-sized arena + finalizer plumbing outweighs the saved
    // `Vec::reserve` calls for envelopes that fit in a single growth
    // step.
    let buf = rsvelte_bindings_support::napi_raw_parse::encode_root_to_vec_with_flags(
        &ast, source, skip_loc, skip_css,
    );
    Ok(buf.into())
}

/// Build a compile failure as an object shaped like the official compiler's
/// `CompileError` (`code`, `message`, `filename`, `start`, `end`, `position`,
/// `frame`), so a consumer can place and render the diagnostic instead of
/// parsing a Rust `Debug` dump out of `message`.
fn compile_error_object<'env>(
    env: &'env Env,
    source: &str,
    filename: Option<&str>,
    diagnostic: &rsvelte_core::compiler::CompileErrorDiagnostic,
) -> napi::Result<napi::bindgen_prelude::Object<'env>> {
    let mut obj = env.create_error(napi::Error::from_reason(diagnostic.message.clone()))?;
    obj.set("name", "CompileError")?;
    // `create_error` seeds `code` with napi's status string; overwrite it so
    // a raising site with no Svelte code reports `null` rather than the
    // meaningless `GenericFailure`.
    match &diagnostic.code {
        Some(code) => obj.set("code", code.as_str())?,
        None => obj.set("code", napi::bindgen_prelude::Null)?,
    }
    if let Some(filename) = filename {
        obj.set("filename", filename)?;
    }
    if let Some(span) = diagnostic.span {
        let located = rsvelte_core::compiler::source_span(source, span);
        let position = [
            napi_u32(located.start.character)?,
            napi_u32(located.end.character)?,
        ];
        obj.set("start", position_object(env, &located.start)?)?;
        obj.set("end", position_object(env, &located.end)?)?;
        obj.set("position", position.to_vec())?;
        obj.set("frame", located.frame.as_str())?;
    }
    Ok(obj)
}

/// Wrap a compile failure as a `napi::Error` that carries the object above, so
/// both the sync entries (which throw it) and the async one (which rejects with
/// it) surface the same shape. napi-rs reuses the referenced JS value verbatim
/// on the owning thread instead of rebuilding one from `reason`.
fn compile_error(
    env: Env,
    source: &str,
    filename: Option<&str>,
    e: &rsvelte_core::compiler::CompileError,
) -> napi::Error {
    let diagnostic = e.diagnostic();
    match compile_error_object(&env, source, filename, &diagnostic) {
        Ok(obj) => napi::Error::from(obj.to_unknown()),
        // Nothing was built, so the message still has to carry the failure.
        Err(_) => napi::Error::from_reason(diagnostic.message),
    }
}

fn napi_u32(value: usize) -> napi::Result<u32> {
    u32::try_from(value).map_err(|_| napi::Error::from_reason("source position exceeds u32"))
}

fn position_object<'env>(
    env: &'env Env,
    p: &rsvelte_core::compiler::Position,
) -> napi::Result<napi::bindgen_prelude::Object<'env>> {
    let mut obj = napi::bindgen_prelude::Object::new(env)?;
    obj.set("line", napi_u32(p.line)?)?;
    obj.set("column", napi_u32(p.column)?)?;
    obj.set("character", napi_u32(p.character)?)?;
    Ok(obj)
}

///
/// Takes source code and an options object, returns a result object
/// matching the official `svelte/compiler` output shape.
///
/// # Errors
///
/// Returns an error when option conversion or compilation fails.
#[allow(
    clippy::needless_pass_by_value,
    reason = "napi-rs owns JavaScript arguments at the exported ABI boundary"
)]
#[napi(js_name = "compile", catch_unwind)]
pub fn napi_compile(
    env: Env,
    source: String,
    options: Option<NapiCompileOptionsArg>,
) -> napi::Result<Value> {
    let opts = options_to_compile(Some(&env), options)?;
    let filename = opts.filename.clone();

    match rust_compile(&source, opts) {
        Ok(result) => Ok(compile_result_to_json(result)),
        Err(error) => Err(compile_error(env, &source, filename.as_deref(), &error)),
    }
}

/// Compile a component to both client and server output in one parse and
/// analysis pass. `options.generate` is ignored; the result has `client` and
/// `server` fields shaped like the `compile` return value.
///
/// # Errors
///
/// Returns an error when option conversion or compilation fails.
#[allow(
    clippy::needless_pass_by_value,
    reason = "napi-rs owns JavaScript arguments at the exported ABI boundary"
)]
#[napi(js_name = "compileBoth", catch_unwind)]
pub fn napi_compile_both(
    env: Env,
    source: String,
    options: Option<NapiCompileOptionsArg>,
) -> napi::Result<Value> {
    let opts = options_to_compile(Some(&env), options)?;
    let filename = opts.filename.clone();

    match rust_compile_both(&source, opts) {
        Ok((client, server)) => Ok(serde_json::json!({
            "client": compile_result_to_json(client),
            "server": compile_result_to_json(server),
        })),
        Err(error) => Err(compile_error(env, &source, filename.as_deref(), &error)),
    }
}

/// Serialize a `CompileResult` into the JSON shape the sync `compile`
/// entry returns. Shared by the callback-bridge entry below.
fn compile_result_to_json(result: rsvelte_core::compiler::CompileResult) -> Value {
    let js_obj = serde_json::json!({
        "code": result.js.code,
        "map": result.js.map.as_deref().map_or(Value::Null, |m| serde_json::from_str::<Value>(m).unwrap_or(Value::Null)),
    });
    let css_obj = result.css.map(|c| {
        serde_json::json!({
            "code": c.code,
            "map": c.map.as_deref().map_or(Value::Null, |m| serde_json::from_str::<Value>(m).unwrap_or(Value::Null)),
            "hasGlobal": c.has_global,
        })
    });
    serde_json::json!({
        "js": js_obj,
        "css": css_obj,
        "warnings": warnings_to_json(&result.warnings),
        "metadata": { "runes": result.metadata.runes },
        "ast": result.ast.as_deref()
            .and_then(|ast| serde_json::from_str::<Value>(ast).ok())
            .unwrap_or(Value::Null),
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
///
/// # Errors
///
/// Returns an error when options are invalid or the JavaScript callback fails.
///
/// # Panics
///
/// Panics if the callback handle or error slot is poisoned.
#[allow(
    clippy::needless_pass_by_value,
    clippy::trailing_empty_array,
    clippy::unused_async,
    reason = "napi-rs requires owned ABI arguments and async Promise exports; its macro emits the zero-sized array"
)]
#[napi(js_name = "compileWithCssHash", catch_unwind, ts_return_type = "any")]
pub async fn napi_compile_with_css_hash(
    source: String,
    options: Option<NapiCompileOptionsArg>,
    #[napi(
        ts_arg_type = "(input: { hash: (str: string) => string, css: string, name: string, filename: string }) => string"
    )]
    css_hash: css_hash_bridge::JsCssHashCb,
) -> napi::Result<CssHashOutcome> {
    // The callback arrives as its own argument, so a `cssHash` left on the
    // options object is this same function — drop it instead of rejecting it the
    // way the synchronous entries do.
    let mut options = options;
    if let Some(o) = options.as_mut() {
        o.inner.css_hash = None;
    }
    // An `async` export's arguments must be `Send`; `Env` is not, so this is
    // the one entry whose option failure cannot carry the coded shape.
    let mut opts = options_to_compile(None, options)?;
    let filename = opts.filename.clone();
    let handle: css_hash_bridge::Handle =
        std::sync::Arc::new(std::sync::RwLock::new(Some(css_hash)));
    // A throwing cssHash surfaces here so it can be propagated as a compile
    // failure (matching upstream, where the exception aborts compilation).
    let error_slot = css_hash_bridge::ErrorSlot::default();
    opts.css_hash = Some(css_hash_bridge::build(
        std::sync::Arc::clone(&handle),
        std::sync::Arc::clone(&error_slot),
        opts.root_dir.clone(),
    ));

    let result = napi::tokio::task::block_in_place(|| rust_compile(&source, opts));

    // Drop the TSFN while V8 handles are still valid (see oxfmt's cleanup note).
    let _ = handle.write().unwrap().take();

    let callback_error = error_slot.lock().unwrap().take();
    if let Some(msg) = callback_error {
        return Err(napi::Error::from_reason(msg));
    }
    match result {
        Ok(r) => Ok(CssHashOutcome::Compiled(Box::new(compile_result_to_json(
            r,
        )))),
        Err(e) => Ok(CssHashOutcome::Failed {
            source,
            filename,
            diagnostic: e.diagnostic(),
        }),
    }
}

/// The async entry's outcome.
///
/// A failure travels as data because the official-shaped error object can only
/// be built on the JS thread during conversion.
pub enum CssHashOutcome {
    Compiled(Box<Value>),
    Failed {
        source: String,
        filename: Option<String>,
        diagnostic: rsvelte_core::compiler::CompileErrorDiagnostic,
    },
}

impl napi::bindgen_prelude::ToNapiValue for CssHashOutcome {
    unsafe fn to_napi_value(
        env: napi::sys::napi_env,
        val: Self,
    ) -> napi::Result<napi::sys::napi_value> {
        match val {
            // SAFETY: `env` is the caller's obligation, forwarded unchanged to
            // the inner conversion, which carries the same contract.
            Self::Compiled(v) => unsafe {
                napi::bindgen_prelude::ToNapiValue::to_napi_value(env, *v)
            },
            Self::Failed {
                source,
                filename,
                diagnostic,
            } => {
                let env = Env::from_raw(env);
                Err(
                    match compile_error_object(&env, &source, filename.as_deref(), &diagnostic) {
                        Ok(obj) => napi::Error::from(obj.to_unknown()),
                        Err(_) => napi::Error::from_reason(diagnostic.message),
                    },
                )
            }
        }
    }
}

mod css_hash_bridge {
    use napi::Status;
    use napi::bindgen_prelude::{FromNapiValue, ToNapiValue, block_on};
    use napi::threadsafe_function::ThreadsafeFunction;
    use rsvelte_core::compiler::{CssHashFn, CssHashInput};
    use serde_json::Value;
    use std::sync::{Arc, Mutex, RwLock};

    /// The single argument upstream hands a `cssHash` callback:
    /// `{ hash, css, name, filename }`. `hash` is a real JS function wrapping the
    /// compiler's own digest, so `({ hash, css }) => \`x-${hash(css)}\`` — the
    /// documented idiom — works verbatim.
    pub struct CssHashArg {
        pub name: String,
        pub filename: String,
        pub css: String,
        pub hash: Arc<dyn Fn(&str) -> String + Send + Sync>,
    }

    impl ToNapiValue for CssHashArg {
        unsafe fn to_napi_value(
            env: napi::sys::napi_env,
            val: Self,
        ) -> napi::Result<napi::sys::napi_value> {
            let e = napi::Env::from_raw(env);
            let mut obj = napi::bindgen_prelude::Object::new(&e)?;
            obj.set("name", val.name)?;
            obj.set("filename", val.filename)?;
            obj.set("css", val.css)?;
            let digest = val.hash;
            let hash_fn: napi::bindgen_prelude::Function<'_, String, String> = e
                .create_function_from_closure("hash", move |ctx| {
                    let input: String = ctx.get::<String>(0).unwrap_or_default();
                    Ok(digest(&input))
                })?;
            obj.set("hash", hash_fn)?;
            // SAFETY: same env, and `obj` is a value created from it.
            unsafe { napi::bindgen_prelude::Object::to_napi_value(env, obj) }
        }
    }

    // One `{ hash, css, name, filename }` object in, the scope class out. A
    // non-string return falls back to the default hash (as upstream's own
    // `cssHash` default would); a throw aborts the compile.
    // `CalleeHandled = false` so the callback receives the argument directly.
    pub type JsCssHashCb = ThreadsafeFunction<CssHashArg, Value, CssHashArg, Status, false>;

    pub type Handle = Arc<RwLock<Option<JsCssHashCb>>>;
    pub type ErrorSlot = Arc<Mutex<Option<String>>>;

    pub fn build(handle: Handle, error_slot: ErrorSlot, root_dir: Option<String>) -> CssHashFn {
        Arc::new(move |input: &CssHashInput| -> String {
            let guard = handle.read().unwrap();
            let Some(cb) = guard.as_ref() else {
                return default_hash(input, root_dir.as_deref());
            };
            let arg = CssHashArg {
                name: input.name.clone(),
                filename: input.filename.clone(),
                css: input.css.clone(),
                hash: Arc::clone(&input.hash),
            };
            // `call_async_catch`, never `call_async`: the latter routes a JS
            // throw through `napi_fatal_exception`, which kills the process
            // instead of failing the compile.
            let outcome = block_on(async { cb.call_async_catch(arg).await });
            drop(guard);
            match outcome {
                // A non-string return is not usable as a scope class.
                Ok(v) => v.as_str().map_or_else(
                    || default_hash(input, root_dir.as_deref()),
                    ToString::to_string,
                ),
                Err(e) => {
                    // Record the first thrown cssHash error; the returned hash is
                    // discarded once the caller sees the recorded failure. Upstream
                    // lets the exception abort compilation.
                    error_slot
                        .lock()
                        .unwrap()
                        .get_or_insert_with(|| callback_error_message(&e));
                    default_hash(input, root_dir.as_deref())
                }
            }
        })
    }

    /// The JS `Error.message` when there is one, else the raw reason.
    fn callback_error_message(e: &napi::Error) -> String {
        let reason = e.reason.clone();
        if reason.is_empty() {
            e.to_string()
        } else {
            reason
        }
    }

    // Silence the unused-import lint when the trait is only needed for the bound.
    const _: fn() = || {
        fn assert_from_napi<T: FromNapiValue>() {}
        assert_from_napi::<Value>();
    };

    // Reproduces the compiler's default (no-cssHash) scope hash: the rootDir-relative
    // filename when known, else the CSS content (see phases/2-analyze/types.rs).
    fn default_hash(input: &CssHashInput, root_dir: Option<&str>) -> String {
        use rsvelte_core::compiler::phases::phase3_transform::css::generate_css_hash;
        if input.filename == "(unknown)" {
            return generate_css_hash(&input.css);
        }
        let mut fname = input.filename.replace('\\', "/");
        if let Some(rd) = root_dir {
            let rd = rd.replace('\\', "/");
            if fname.starts_with(&rd) {
                fname = fname[rd.len()..].trim_start_matches('/').to_string();
            }
        }
        generate_css_hash(&fname)
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
    Object(Vec<(String, Self)>),
    // A JS function. Kept apart from `Other` because `cssHash` is *only* legal
    // as a function, so "a function was passed" and "a wrong type was passed"
    // are different diagnoses.
    Function,
    // Arrays, symbols and other non-scalars — JS-truthy, but not a
    // value any option can consume.
    Other,
}

impl LenientScalar {
    const fn is_object(&self) -> bool {
        matches!(self, Self::Object(_))
    }

    fn field(&self, key: &str) -> Option<&Self> {
        match self {
            Self::Object(fields) => fields.iter().find(|(k, _)| k == key).map(|(_, v)| v),
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
    let status = unsafe { napi::sys::napi_typeof(env, napi_val, &raw mut val_type) };
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
            napi::sys::ValueType::napi_function => LenientScalar::Function,
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
        Ok(Self(unsafe { decode_scalar(env, napi_val)? }))
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
        let status = unsafe { napi::sys::napi_typeof(env, napi_val, &raw mut val_type) };
        if status != napi::sys::Status::napi_ok {
            return Err(napi::Error::from_status(napi::Status::from(status)));
        }
        if val_type != napi::sys::ValueType::napi_object {
            // SAFETY: valid handles; non-object values are decoded directly.
            return unsafe { decode_scalar(env, napi_val) };
        }
        let mut is_array = false;
        // SAFETY: valid handles; `napi_is_array` only reads them and writes the flag.
        let st = unsafe { napi::sys::napi_is_array(env, napi_val, &raw mut is_array) };
        if st != napi::sys::Status::napi_ok {
            return Err(napi::Error::from_status(napi::Status::from(st)));
        }
        if is_array {
            return Ok(Self::Other);
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
        Ok(Self::Object(fields))
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
                Self::Bool(b) => bool::to_napi_value(env, b),
                Self::Number(n) => f64::to_napi_value(env, n),
                Self::Str(s) => String::to_napi_value(env, s),
                Self::Object(_) | Self::Function | Self::Other => {
                    napi::bindgen_prelude::Null::to_napi_value(env, napi::bindgen_prelude::Null)
                }
            }
        }
    }
}

/// An option-validation failure carried as data.
///
/// `napi::Error`'s `code` is its `Status`, a closed enum with no room for
/// `options_invalid_value`, so the coded shape has to be an object built from an
/// `Env` — which option parsing does not have. Keeping the failure as a value
/// lets the entry point raise it in upstream's `CompileError` shape while every
/// raising site still goes through one constructor.
struct OptionError {
    /// `None` is an rsvelte-only refusal, which upstream has no code for;
    /// `compile_error_object` writes `null` for the same reason.
    code: Option<&'static str>,
    message: String,
}

impl OptionError {
    /// Upstream throws these as a `CompileError` with `message`, `name`, `code`
    /// and (when supplied) `filename` enumerable, and no span — the diagnostic
    /// node is `null`, so `start`/`end`/`frame` never exist.
    ///
    /// `env` is `None` only where one cannot exist — an `async` export's
    /// arguments must be `Send`, and `Env` is not — and there the failure keeps
    /// the message but loses the coded shape.
    fn into_napi(self, env: Option<&Env>, filename: Option<&str>) -> napi::Error {
        let Some(env) = env else {
            return napi::Error::from_reason(self.message);
        };
        let build = || -> napi::Result<napi::Error> {
            let mut obj = env.create_error(napi::Error::from_reason(self.message.clone()))?;
            obj.set("name", "CompileError")?;
            match self.code {
                Some(code) => obj.set("code", code)?,
                None => obj.set("code", napi::bindgen_prelude::Null)?,
            }
            if let Some(filename) = filename {
                obj.set("filename", filename)?;
            }
            Ok(napi::Error::from(obj.to_unknown()))
        };
        build().unwrap_or_else(|_| napi::Error::from_reason(self.message))
    }
}

/// Every option-validation failure upstream raises through
/// `validate-options.js`'s `throw_error`, which is `e.options_invalid_value`.
fn invalid_option(detail: impl std::fmt::Display) -> OptionError {
    OptionError {
        code: Some("options_invalid_value"),
        message: format!(
            "Invalid compiler option: {detail}\nhttps://svelte.dev/e/options_invalid_value"
        ),
    }
}

// Function-valued options must be resolved by a JavaScript wrapper before the
// synchronous native boundary. Silently treating them as absent can compile a
// component in the wrong mode while still returning success.
const RESOLVE_IN_JS: &str = "a function-valued `{}` cannot be evaluated at this entry point; \
     resolve it in JavaScript (the `compile` wrapper in @rsvelte/vite-plugin-svelte-native does) \
     or pass a plain value";

/// `validate-options.js`'s `removed()`: an option that still has a name but no
/// behaviour. Unlike `warn_removed()` (which only warns) this throws.
fn removed_option(detail: &str) -> OptionError {
    OptionError {
        code: Some("options_removed"),
        message: format!("Invalid compiler option: {detail}\nhttps://svelte.dev/e/options_removed"),
    }
}

/// `validate-options.js`'s `object()` reports a key it does not declare, before
/// running any per-option validator.
fn unrecognised_option(keypath: &str) -> OptionError {
    OptionError {
        code: Some("options_unrecognised"),
        message: format!(
            "Unrecognised compiler option {keypath}\nhttps://svelte.dev/e/options_unrecognised"
        ),
    }
}

/// A value upstream accepts that this entry point cannot honour. There is no
/// upstream code for it because upstream never raises it.
fn unsupported_option(detail: impl std::fmt::Display) -> OptionError {
    OptionError {
        code: None,
        message: detail.to_string(),
    }
}

type OptionResult<T> = Result<T, OptionError>;

fn coerce_bool(keypath: &str, v: &LenientScalar) -> OptionResult<bool> {
    match v {
        LenientScalar::Bool(b) => Ok(*b),
        _ => Err(invalid_option(format!(
            "{keypath} should be true or false, if specified"
        ))),
    }
}

fn coerce_string(keypath: &str, v: &LenientScalar) -> OptionResult<String> {
    match v {
        LenientScalar::Str(s) => Ok(s.clone()),
        _ => Err(invalid_option(format!(
            "{keypath} should be a string, if specified"
        ))),
    }
}

// Upstream's `validate-options.js` defaults `rootDir` to `process.cwd()`
// evaluated once at module load, not per compile call; caching it here
// matches that and turns a getcwd syscall on every absolute-filename compile
// into a one-time cost. A mid-process `chdir()` would go unnoticed, but the
// NAPI addon is loaded once per long-lived process (Node/Vite), same as upstream.
fn cached_current_dir() -> Option<String> {
    static CWD: std::sync::OnceLock<Option<String>> = std::sync::OnceLock::new();
    CWD.get_or_init(|| {
        std::env::current_dir()
            .ok()
            .map(|cwd| cwd.to_string_lossy().to_string())
    })
    .clone()
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

/// Returns the mode plus whether the pre-Svelte-5 `dom`/`ssr` spelling was used
/// (which upstream reports as `options_renamed_ssr_dom`).
fn coerce_generate(v: &LenientScalar) -> OptionResult<(GenerateMode, bool)> {
    let msg = "generate must be \"client\", \"server\" or false";
    match v {
        LenientScalar::Bool(false) => Ok((GenerateMode::None, false)),
        LenientScalar::Str(s) => match s.as_str() {
            "client" => Ok((GenerateMode::Client, false)),
            "dom" => Ok((GenerateMode::Client, true)),
            "server" => Ok((GenerateMode::Server, false)),
            "ssr" => Ok((GenerateMode::Server, true)),
            "false" => Ok((GenerateMode::None, false)),
            _ => Err(invalid_option(msg)),
        },
        _ => Err(invalid_option(msg)),
    }
}

// Both validators call the same `w.options_renamed_ssr_dom`, so component and
// module compiles share one `warn_once` latch.
static WARNED_RENAMED_SSR_DOM: std::sync::atomic::AtomicBool =
    std::sync::atomic::AtomicBool::new(false);

fn coerce_namespace(v: &LenientScalar) -> OptionResult<Namespace> {
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

fn coerce_css(v: &LenientScalar) -> OptionResult<CssMode> {
    match v {
        LenientScalar::Bool(_) => Err(invalid_option(
            "The boolean options have been removed from the css option. Use \"external\" instead of false and \"injected\" instead of true",
        )),
        LenientScalar::Str(s) => match s.as_str() {
            "external" => Ok(CssMode::External),
            "injected" => Ok(CssMode::Injected),
            "none" => Err(invalid_option(
                "css: \"none\" is no longer a valid option. If this was crucial for you, please open an issue on GitHub with your use case.",
            )),
            _ => Err(invalid_option(
                "css should be either \"external\" (default, recommended) or \"injected\"",
            )),
        },
        _ => Err(invalid_option(
            "css should be either \"external\" (default, recommended) or \"injected\"",
        )),
    }
}

fn coerce_fragments(v: &LenientScalar) -> OptionResult<rsvelte_core::compiler::FragmentMode> {
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
fn coerce_component_api(v: &LenientScalar) -> OptionResult<rsvelte_core::compiler::ComponentApi> {
    match v {
        LenientScalar::Number(n) if n.to_bits() == 4.0_f64.to_bits() => {
            Ok(rsvelte_core::compiler::ComponentApi::V4)
        }
        LenientScalar::Number(n) if n.to_bits() == 5.0_f64.to_bits() => {
            Ok(rsvelte_core::compiler::ComponentApi::V5)
        }
        _ => Err(invalid_option(
            "compatibility.componentApi should be either \"4\" or \"5\"",
        )),
    }
}

// Upstream `experimental: object({ async: boolean(false) })`: a non-object is
// rejected; a missing/`null`/`undefined` `async` keeps the default.
fn coerce_experimental(v: &LenientScalar) -> OptionResult<ExperimentalOptions> {
    if !v.is_object() {
        return Err(invalid_option("experimental should be an object"));
    }
    reject_unrecognised_child(v, "experimental", &["async"])?;
    let mut exp = ExperimentalOptions::default();
    if let Some(a) = v.field("async") {
        exp.r#async = coerce_bool("experimental.async", a)?;
    }
    Ok(exp)
}

fn coerce_compatibility(v: &LenientScalar) -> OptionResult<rsvelte_core::compiler::ComponentApi> {
    if !v.is_object() {
        return Err(invalid_option("compatibility should be an object"));
    }
    reject_unrecognised_child(v, "compatibility", &["componentApi"])?;
    v.field("componentApi").map_or_else(
        || Ok(rsvelte_core::compiler::ComponentApi::default()),
        coerce_component_api,
    )
}

/// A nested `object()` validator reports an unknown key under its own keypath,
/// at the point the parent walks it rather than before every other option.
fn reject_unrecognised_child(v: &LenientScalar, keypath: &str, known: &[&str]) -> OptionResult<()> {
    let LenientScalar::Object(fields) = v else {
        return Ok(());
    };
    fields
        .iter()
        .find(|(k, _)| !known.contains(&k.as_str()))
        .map_or(Ok(()), |(k, _)| {
            Err(unrecognised_option(&format!("{keypath}.{k}")))
        })
}

/// Typed mirror of `CompileOptions` for the NAPI boundary.
///
/// Field names use `#[napi(object)]`'s automatic camelCase conversion, keeping
/// the JavaScript shape identical to the legacy `Value` options argument.
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
    /// `SourceMap` v3 object **or** its serialized JSON string — both
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
    /// Upstream's `cssHash` callback. The synchronous entries cannot call back
    /// into JavaScript, so this is declared only to be *rejected* there: dropping
    /// it silently hands the caller a different scope class than it asked for.
    /// `compileWithCssHash` is the entry that honours it.
    pub css_hash: Option<LenientScalar>,
    /// Pre-computed deterministic hash for the test harness (the JS
    /// `cssHash` callback can't be called from Rust).
    pub css_hash_override: Option<String>,
    pub fragments: Option<LenientScalar>,
    /// Svelte-4 `enableSourcemap`. Unrelated to the internal
    /// `CompileOptions::enable_sourcemap` perf switch — the only thing this
    /// key does is raise `options_removed_enable_sourcemap`.
    pub enable_sourcemap: Option<LenientScalar>,
    /// Svelte-4 `hydratable`, kept only to raise `options_removed_hydratable`.
    pub hydratable: Option<LenientScalar>,
    /// Svelte-4 `loopGuardTimeout`, kept only to raise
    /// `options_removed_loop_guard_timeout`.
    pub loop_guard_timeout: Option<LenientScalar>,
    /// Upstream's `warningFilter` callback. Declared so a wrong type is rejected
    /// the way upstream's `fun()` rejects it, and so the callback form is not
    /// mistaken for an unrecognised key; the synchronous entries still cannot
    /// call it, and `@rsvelte/vite-plugin-svelte-native` applies it in JS.
    pub warning_filter: Option<LenientScalar>,
    /// The six Svelte-4 options upstream declares only so that using one is an
    /// error. Presence alone is the signal — `undefined` is absence, `null` is
    /// not.
    pub legacy: Option<LenientScalar>,
    pub format: Option<LenientScalar>,
    pub tag: Option<LenientScalar>,
    pub svelte_path: Option<LenientScalar>,
    pub error_mode: Option<LenientScalar>,
    pub vars_report: Option<LenientScalar>,
}

/// The keys upstream's `validate-options.js` declares: `common_options` plus
/// `component_options`. Anything else is `options_unrecognised`. One list serves
/// both entry points because `validate_module_options` reuses the same key set,
/// mapping every component key to a no-op validator. `cssHashOverride` is
/// rsvelte's own constant-hash hatch and has no upstream counterpart.
///
/// This must stay equal to the two option structs' declared fields;
/// `scripts/dev/test-napi-compile-options.mjs` reconciles it against them.
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
    "cssHashOverride",
];

// Upstream's `warn_once` keeps its `warned` set for the lifetime of the
// compiler module, so a removed option is reported once per process no matter
// how many components are compiled; the addon is loaded once per process too.
fn warn_once(warned: &std::sync::atomic::AtomicBool) -> bool {
    !warned.swap(true, std::sync::atomic::Ordering::Relaxed)
}

impl NapiCompileOptions {
    /// Convert into the compiler's native `CompileOptions`, mirroring the
    /// upstream `validate-options.js`: an absent field keeps its default and a
    /// wrong JS type is rejected with the upstream message.
    #[allow(
        clippy::too_many_lines,
        reason = "option conversion stays contiguous to make the JavaScript-to-compiler mapping auditable"
    )]
    fn into_compile_options(self) -> OptionResult<CompileOptions> {
        let mut opts = CompileOptions::default();
        // The arms below run in `validate-options.js`'s key-declaration order,
        // which is the order its `object()` validator walks them in — with two
        // bad options the one that surfaces is the earlier key, not an arbitrary
        // one.
        if let Some(v) = &self.filename {
            opts.filename = Some(coerce_string("filename", v)?);
        }
        // An absolute cwd cannot affect a relative filename, so defer the
        // filesystem query unless the default rootDir can actually strip it.
        if let Some(v) = &self.root_dir {
            opts.root_dir = Some(coerce_string("rootDir", v)?);
        } else if opts
            .filename
            .as_deref()
            .is_some_and(|filename| std::path::Path::new(filename).is_absolute())
            && let Some(cwd) = cached_current_dir()
        {
            opts.root_dir = Some(cwd);
        }
        if let Some(v) = &self.dev {
            opts.dev = coerce_bool("dev", v)?;
        }
        if let Some(v) = &self.generate {
            let (mode, renamed) = coerce_generate(v)?;
            opts.generate = mode;
            if renamed {
                opts.legacy_options.generate_dom_ssr = warn_once(&WARNED_RENAMED_SSR_DOM);
            }
        }
        if let Some(v) = &self.warning_filter {
            // `fun()`: the type is validated here even though the synchronous
            // entries cannot invoke the callback.
            if !matches!(v, LenientScalar::Function) {
                return Err(invalid_option(
                    "warningFilter should be a function, if specified",
                ));
            }
        }
        if let Some(v) = &self.experimental {
            opts.experimental = coerce_experimental(v)?;
        }
        if let Some(v) = &self.accessors {
            opts.accessors = coerce_bool("accessors", v)?;
            // Upstream reaches this one through `deprecate()`, which is `warn_once`
            // like the removed options below — not once per compile.
            static WARNED: std::sync::atomic::AtomicBool =
                std::sync::atomic::AtomicBool::new(false);
            opts.legacy_options.accessors = warn_once(&WARNED);
        }
        if let Some(v) = &self.css_hash {
            return Err(match v {
                LenientScalar::Function => unsupported_option(
                    "A function-valued `cssHash` cannot be called from this entry point; use `compileWithCssHash` (or `compileAsync`, which routes to it).",
                ),
                _ => invalid_option("cssHash should be a function, if specified"),
            });
        }
        if let Some(v) = &self.css_output_filename {
            opts.css_output_filename = Some(coerce_string("cssOutputFilename", v)?);
        }
        if let Some(v) = &self.disclose_version {
            opts.disclose_version = coerce_bool("discloseVersion", v)?;
        }
        if let Some(v) = &self.immutable {
            opts.immutable = coerce_bool("immutable", v)?;
            static WARNED: std::sync::atomic::AtomicBool =
                std::sync::atomic::AtomicBool::new(false);
            opts.legacy_options.immutable = warn_once(&WARNED);
        }
        if self.legacy.is_some() {
            return Err(removed_option(
                "The legacy option has been removed. If you are using this because of legacy.componentApi, use compatibility.componentApi instead",
            ));
        }
        if let Some(v) = &self.compatibility {
            opts.compatibility.component_api = coerce_compatibility(v)?;
        }
        if self.loop_guard_timeout.is_some() {
            static WARNED: std::sync::atomic::AtomicBool =
                std::sync::atomic::AtomicBool::new(false);
            opts.legacy_options.loop_guard_timeout = warn_once(&WARNED);
        }
        if let Some(v) = &self.name {
            opts.name = Some(coerce_string("name", v)?);
        }
        if let Some(v) = &self.namespace {
            opts.namespace = coerce_namespace(v)?;
        }
        if let Some(v) = &self.modern_ast {
            opts.modern_ast = coerce_bool("modernAst", v)?;
        }
        if let Some(v) = &self.output_filename {
            opts.output_filename = Some(coerce_string("outputFilename", v)?);
        }
        if let Some(v) = &self.preserve_comments {
            opts.preserve_comments = coerce_bool("preserveComments", v)?;
        }
        if let Some(v) = &self.fragments {
            opts.fragments = coerce_fragments(v)?;
        }
        if let Some(v) = &self.preserve_whitespace {
            opts.preserve_whitespace = coerce_bool("preserveWhitespace", v)?;
        }
        if let Some(v) = &self.runes {
            // Upstream's `parametric` keeps the function and calls it with
            // `{ filename }`; this boundary cannot, and auto-detecting instead
            // compiles a file the caller asked to be runes as legacy.
            if matches!(v, LenientScalar::Function) {
                return Err(invalid_option(RESOLVE_IN_JS.replace("{}", "runes")));
            }
            opts.runes = coerce_runes(v);
        }
        if let Some(v) = &self.hmr {
            opts.hmr = coerce_bool("hmr", v)?;
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
        if self.enable_sourcemap.is_some() {
            static WARNED: std::sync::atomic::AtomicBool =
                std::sync::atomic::AtomicBool::new(false);
            opts.legacy_options.enable_sourcemap = warn_once(&WARNED);
        }
        if self.hydratable.is_some() {
            static WARNED: std::sync::atomic::AtomicBool =
                std::sync::atomic::AtomicBool::new(false);
            opts.legacy_options.hydratable = warn_once(&WARNED);
        }
        if self.format.is_some() {
            return Err(removed_option(
                "The format option has been removed in Svelte 4, the compiler only outputs ESM now. Remove \"format\" from your compiler options. If you did not set this yourself, bump the version of your bundler plugin (vite-plugin-svelte/rollup-plugin-svelte/svelte-loader)",
            ));
        }
        if self.tag.is_some() {
            return Err(removed_option(
                "The tag option has been removed in Svelte 5. Use `<svelte:options customElement=\"tag-name\" />` inside the component instead. If that does not solve your use case, please open an issue on GitHub with details.",
            ));
        }
        if self.svelte_path.is_some() {
            return Err(removed_option(
                "The sveltePath option has been removed in Svelte 5. If this option was crucial for you, please open an issue on GitHub with your use case.",
            ));
        }
        if self.error_mode.is_some() {
            return Err(removed_option(
                "The errorMode option has been removed. If you are using this through svelte-preprocess with TypeScript, use the https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax setting instead",
            ));
        }
        if self.vars_report.is_some() {
            return Err(removed_option(
                "The vars option has been removed. If you are using this through svelte-preprocess with TypeScript, use the https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax setting instead",
            ));
        }
        // `customElement` and `css` are `parametric()`, whose normalizer runs on
        // the first CALL rather than during validation — so upstream reports
        // them only after every plain validator has passed, and `customElement`
        // (read during analysis) before `css`.
        if let Some(v) = &self.custom_element {
            // `parametric`, not `boolean`: upstream's message has no
            // ", if specified" tail here.
            opts.custom_element = match v {
                LenientScalar::Bool(b) => *b,
                _ => return Err(invalid_option("customElement should be true or false")),
            };
        }
        if let Some(v) = &self.css {
            opts.css = coerce_css(v)?;
        }
        // rsvelte-only, and never a failure: it has no upstream position.
        if let Some(hash_override) = self.css_hash_override {
            opts.css_hash = Some(std::sync::Arc::new(
                move |_: &rsvelte_core::compiler::CssHashInput| hash_override.clone(),
            ));
        }
        Ok(opts)
    }
}

/// Typed mirror of `ModuleCompileOptions`.
///
/// Upstream's `validate_module_options` is `common_options` plus every
/// *component* key mapped to a no-op, so a component-only key is accepted and
/// ignored here rather than validated — that is why this declares fewer fields
/// than `RECOGNISED_COMPILE_OPTIONS` lists.
#[napi(object)]
pub struct NapiModuleCompileOptions {
    pub dev: Option<LenientScalar>,
    pub generate: Option<LenientScalar>,
    pub filename: Option<LenientScalar>,
    pub root_dir: Option<LenientScalar>,
    pub experimental: Option<LenientScalar>,
    /// A `common_options` key, so — unlike the component options — its type is
    /// validated on this entry point too.
    pub warning_filter: Option<LenientScalar>,
}

impl NapiModuleCompileOptions {
    fn into_module_compile_options(self) -> OptionResult<ModuleCompileOptions> {
        let mut opts = ModuleCompileOptions::default();
        if let Some(v) = &self.filename {
            opts.filename = Some(coerce_string("filename", v)?);
        }
        if let Some(v) = &self.root_dir {
            opts.root_dir = Some(coerce_string("rootDir", v)?);
        }
        if let Some(v) = &self.dev {
            opts.dev = coerce_bool("dev", v)?;
        }
        if let Some(v) = &self.generate {
            let (mode, renamed) = coerce_generate(v)?;
            opts.generate = mode;
            if renamed {
                opts.legacy_options.generate_dom_ssr = warn_once(&WARNED_RENAMED_SSR_DOM);
            }
        }
        if let Some(v) = &self.warning_filter
            && !matches!(v, LenientScalar::Function)
        {
            return Err(invalid_option(
                "warningFilter should be a function, if specified",
            ));
        }
        if let Some(v) = &self.experimental {
            opts.experimental = coerce_experimental(v)?;
        }
        Ok(opts)
    }
}

/// The one thing `#[napi(object)]` structurally cannot see: the keys it does
/// *not* declare. Its generated decoder reads declared fields by name and never
/// enumerates the object, so an unrecognised key reaches the compiler as
/// silence. These wrappers decode the key list alongside the fields, letting the
/// conversion raise `options_unrecognised` first — the position upstream's
/// `object()` validator reports it from.
pub struct NapiCompileOptionsArg {
    inner: NapiCompileOptions,
    unrecognised: Option<String>,
}

/// The module entry's counterpart. Its recognised set is the same one: upstream
/// declares every component key on the module validator as a no-op.
pub struct NapiModuleCompileOptionsArg {
    inner: NapiModuleCompileOptions,
    unrecognised: Option<String>,
}

/// Upstream's `object()` walks `for (const key in input)`, so an inherited
/// enumerable key counts and a key whose value is `undefined` still counts.
/// `napi_get_property_names` — what `Object::keys` calls — enumerates the same
/// set, so `{ nonsense: undefined }` is rejected on both sides.
unsafe fn first_unrecognised_key(
    env: napi::sys::napi_env,
    napi_val: napi::sys::napi_value,
) -> napi::Result<Option<String>> {
    let mut val_type = 0;
    // SAFETY: `env`/`napi_val` are valid handles from Node-API; `napi_typeof`
    // only reads them and writes the type tag.
    let status = unsafe { napi::sys::napi_typeof(env, napi_val, &raw mut val_type) };
    if status != napi::sys::Status::napi_ok {
        return Err(napi::Error::from_status(napi::Status::from(status)));
    }
    if val_type != napi::sys::ValueType::napi_object {
        return Ok(None);
    }
    // SAFETY: confirmed object; properties are read through the safe `Object` API.
    let obj = napi::bindgen_prelude::Object::from_raw(env, napi_val);
    Ok(napi::bindgen_prelude::Object::keys(&obj)?
        .into_iter()
        .find(|key| !RECOGNISED_COMPILE_OPTIONS.contains(&key.as_str())))
}

macro_rules! option_arg_wrapper {
    ($wrapper:ty, $inner:ty, $name:literal) => {
        impl napi::bindgen_prelude::TypeName for $wrapper {
            fn type_name() -> &'static str {
                $name
            }
            fn value_type() -> napi::ValueType {
                napi::ValueType::Object
            }
        }

        impl napi::bindgen_prelude::ValidateNapiValue for $wrapper {}

        impl napi::bindgen_prelude::FromNapiValue for $wrapper {
            unsafe fn from_napi_value(
                env: napi::sys::napi_env,
                napi_val: napi::sys::napi_value,
            ) -> napi::Result<Self> {
                // SAFETY: valid handles from Node-API, forwarded to the key scan.
                let unrecognised = unsafe { first_unrecognised_key(env, napi_val)? };
                // SAFETY: the same valid handles, forwarded to the field decoder
                // `#[napi(object)]` derived for the inner struct.
                let inner = unsafe { <$inner>::from_napi_value(env, napi_val)? };
                Ok(Self {
                    inner,
                    unrecognised,
                })
            }
        }

        impl napi::bindgen_prelude::ToNapiValue for $wrapper {
            unsafe fn to_napi_value(
                env: napi::sys::napi_env,
                val: Self,
            ) -> napi::Result<napi::sys::napi_value> {
                // SAFETY: `env` is the valid env Node-API passed in; the derived
                // impl does the work. Input-only in practice — this exists so
                // `#[napi(object)]` structs holding the type satisfy the bound.
                unsafe { <$inner>::to_napi_value(env, val.inner) }
            }
        }
    };
}

option_arg_wrapper!(NapiCompileOptionsArg, NapiCompileOptions, "CompileOptions");
option_arg_wrapper!(
    NapiModuleCompileOptionsArg,
    NapiModuleCompileOptions,
    "ModuleCompileOptions"
);

/// Compatibility wrapper: convert an Option<NapiCompileOptionsArg> (the
/// typed surface) into `CompileOptions`. `None` and `Some(empty)`
/// both produce the defaults.
fn options_to_compile(
    env: Option<&Env>,
    opts: Option<NapiCompileOptionsArg>,
) -> napi::Result<CompileOptions> {
    let Some(opts) = opts else {
        return Ok(CompileOptions::default());
    };
    // Upstream seeds `state.filename` from the raw option before validating, so
    // the option error carries it even when a *later* option is what failed.
    let filename = raw_filename(opts.inner.filename.as_ref());
    opts.unrecognised
        .as_deref()
        .map_or(Ok(()), |key| Err(unrecognised_option(key)))
        .and_then(|()| opts.inner.into_compile_options())
        .map_err(|e| e.into_napi(env, filename.as_deref()))
}

fn options_to_module_compile(
    env: Option<&Env>,
    opts: Option<NapiModuleCompileOptionsArg>,
) -> napi::Result<ModuleCompileOptions> {
    let Some(opts) = opts else {
        return Ok(ModuleCompileOptions::default());
    };
    let filename = raw_filename(opts.inner.filename.as_ref());
    opts.unrecognised
        .as_deref()
        .map_or(Ok(()), |key| Err(unrecognised_option(key)))
        .and_then(|()| opts.inner.into_module_compile_options())
        .map_err(|e| e.into_napi(env, filename.as_deref()))
}

fn raw_filename(v: Option<&LenientScalar>) -> Option<String> {
    match v {
        Some(LenientScalar::Str(s)) => Some(s.clone()),
        _ => None,
    }
}

/// Compile a Svelte module (.svelte.js/.svelte.ts).
///
/// # Errors
///
/// Returns an error when option conversion or compilation fails.
#[allow(
    clippy::needless_pass_by_value,
    reason = "napi-rs owns JavaScript arguments at the exported ABI boundary"
)]
#[napi(js_name = "compileModule", catch_unwind)]
pub fn napi_compile_module(
    env: Env,
    source: String,
    options: Option<NapiModuleCompileOptionsArg>,
) -> napi::Result<Value> {
    let opts = options_to_module_compile(Some(&env), options)?;
    let filename = opts.filename.clone();
    match rust_compile_module(&source, opts) {
        Ok(result) => {
            let js_obj = serde_json::json!({
                "code": result.js.code,
                "map": result.js.map.as_deref()
                    .map_or(Value::Null, |m| serde_json::from_str::<Value>(m).unwrap_or(Value::Null)),
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
        Err(error) => Err(compile_error(env, &source, filename.as_deref(), &error)),
    }
}

/// Convert a Svelte component to TypeScript/TSX for type checking.
///
/// This is the NAPI binding for `svelte2tsx`, used by the Svelte language server
/// and other tooling to get TypeScript representations of Svelte components.
///
/// # Errors
///
/// Returns an error when parsing or projection fails.
#[allow(
    clippy::needless_pass_by_value,
    reason = "napi-rs owns JavaScript arguments at the exported ABI boundary"
)]
#[napi(js_name = "svelte2tsx", catch_unwind)]
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

            // The v3 map is built as JSON text; hand it to JS as an object so the
            // shape matches official svelte2tsx's `generateMap` return value.
            // Unparseable JSON means the map builder is broken, so it must surface
            // rather than silently reach the caller as `null` (issue #2066).
            let map = match result.map.as_deref() {
                Some(json) => serde_json::from_str(json).map_err(|e| {
                    napi::Error::from_reason(format!(
                        "svelte2tsx produced an invalid source map: {e}"
                    ))
                })?,
                None => Value::Null,
            };

            let output = serde_json::json!({
                "code": result.code,
                "map": map,
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

/// Parse JS options object into `Svelte2TsxOptions`.
fn parse_svelte2tsx_options(options: &Value) -> Svelte2TsxOptions {
    Svelte2TsxOptions::from_json(options)
}

// =============================================================================
// vite-plugin-svelte (Wave 3) NAPI surface
// =============================================================================

use rsvelte_bindings_support::vps::{
    ResolveOptions, hmr_diff as rust_hmr_diff, resolve_id as rust_resolve_id,
};

/// Diff two `.svelte` source versions.
///
/// The result lets the JS shim choose Vite's hot-update patch or a full reload.
///
/// # Errors
///
/// Returns an error when the diff cannot be represented for JavaScript.
#[allow(
    clippy::needless_pass_by_value,
    reason = "napi-rs owns JavaScript arguments at the exported ABI boundary"
)]
#[napi(js_name = "hmrDiff", catch_unwind)]
pub fn napi_hmr_diff(prev: String, curr: String) -> napi::Result<Value> {
    let diff = rust_hmr_diff(&prev, &curr);
    let kind = match diff.change {
        rsvelte_bindings_support::vps::HmrChange::HotUpdate => "hot-update",
        rsvelte_bindings_support::vps::HmrChange::FullReload => "full-reload",
        rsvelte_bindings_support::vps::HmrChange::Unchanged => "unchanged",
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
///
/// # Errors
///
/// Returns an error when resolution cannot be represented for JavaScript.
#[allow(
    clippy::needless_pass_by_value,
    reason = "napi-rs owns JavaScript arguments at the exported ABI boundary"
)]
#[napi(js_name = "resolveId", catch_unwind)]
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
/// on the JS thread via N-API's `ThreadsafeFunction` machinery — the
/// heavy lifting (tag extraction, source-map chaining) stays in Rust.
///
/// Shape mirrors `svelte/preprocess`: `{ code, map, dependencies }`.
///
/// # Errors
///
/// Returns an error when a JavaScript preprocessor rejects the input.
#[allow(
    clippy::needless_pass_by_value,
    reason = "napi-rs owns JavaScript arguments at the exported ABI boundary"
)]
#[napi(js_name = "preprocess", catch_unwind)]
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
        Some(v) => Some(coerce_string("filename", v).map_err(|e| e.into_napi(Some(&env), None))?),
        None => None,
    };

    env.execute_tokio_future(
        async move {
            rsvelte_core::compiler::preprocess::preprocess(source, &rust_groups, filename)
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
    use rsvelte_core::compiler::preprocess::encode_sourcemap::decoded_to_v3_json;
    use rsvelte_core::compiler::preprocess::types::{
        AttributeMap as RsAttrMap, AttributeValue as RsAttrValue, MarkupPreprocessorFn,
        MarkupPreprocessorOptions, PreprocessError, PreprocessorFn, PreprocessorGroup,
        PreprocessorOptions, PreprocessorResult, Processed, SimpleDecodedMap, SourceMapInput,
    };
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
    pub enum MaybePromise<T: FromNapiValue + 'static> {
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
            let status = unsafe { napi::sys::napi_is_promise(env, napi_val, &raw mut is_promise) };
            if status != napi::sys::Status::napi_ok {
                return Err(napi::Error::from_status(napi::Status::from(status)));
            }
            if is_promise {
                // SAFETY: same valid `env`/`napi_val`; we just confirmed it is a Promise.
                let p = unsafe { Promise::<T>::from_napi_value(env, napi_val)? };
                Ok(Self::Promise(p))
            } else {
                // SAFETY: same valid `env`/`napi_val`; delegating to `T`'s own decoder.
                let v = unsafe { T::from_napi_value(env, napi_val)? };
                Ok(Self::Value(v))
            }
        }
    }

    // Fatal strategy: the user-supplied JS callback receives the options
    // object as its sole argument — matching the upstream Svelte
    // preprocessor contract `(opts) => Processed | undefined`. The
    // `CalleeHandled = false` const generic suppresses the legacy
    // err-as-first-arg shape that would otherwise break every preprocessor
    // that destructures `{ content, filename }`.
    pub type Tsfn = ThreadsafeFunction<
        Value,
        MaybePromise<Option<JsProcessed>>,
        Value,
        Status,
        false,
        false,
        0,
    >;
    pub type ArcTsfn = std::sync::Arc<Tsfn>;

    pub struct Extracted {
        pub name: Option<String>,
        pub markup: Option<Tsfn>,
        pub script: Option<Tsfn>,
        pub style: Option<Tsfn>,
    }

    pub fn extract_groups(groups: Vec<Object>) -> napi::Result<Vec<Extracted>> {
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

    pub fn build_groups(extracted: Vec<Extracted>) -> Vec<PreprocessorGroup> {
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
                    await_tsfn(&tsfn, arg, Callsite::Markup).await
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
                await_tsfn(&tsfn, arg, Callsite::Tag).await
            })
        })
    }

    /// Upstream reads `processed.code` differently either side of the markup
    /// boundary, and a result without one therefore diverges: markup treats it
    /// as no change, a `<script>` / `<style>` result throws.
    #[derive(Clone, Copy)]
    enum Callsite {
        Markup,
        Tag,
    }

    /// A JS error carries its own message; `Display` on `napi::Error` prefixes
    /// the status, which would replace the user's text with `GenericFailure, …`.
    fn js_reason(error: &napi::Error) -> String {
        if error.reason.is_empty() {
            error.status.to_string()
        } else {
            error.reason.clone()
        }
    }

    async fn await_tsfn(
        tsfn: &Tsfn,
        arg: Value,
        callsite: Callsite,
    ) -> Result<Option<Processed>, PreprocessError> {
        // The upstream Svelte preprocessor contract allows the callback to
        // return `Processed | Promise<Processed> | undefined | null`,
        // sync or async. `MaybePromise<Option<Value>>` probes `napi_is_promise`
        // *before* the typed conversion, so we never let napi-rs call
        // `.then()` on a non-Promise value (which would abort the process via
        // `napi_fatal_error`, surfacing as `threadsafe_function.rs:749 Failed
        // to convert return value … Failed to call then method`). The outer
        // `Option` collapses `undefined`/`null` to `None` on both paths.
        //
        // `call_async` routes a thrown JS error through `napi_fatal_exception`,
        // which kills the host process: the caller's `try`/`catch` never runs and
        // a dev server dies on any preprocessor failure. `call_async_catch`
        // returns it as `Err` instead.
        let resolved = match tsfn.call_async_catch(arg).await {
            Ok(MaybePromise::Promise(promise)) => promise.await,
            Ok(MaybePromise::Value(value)) => Ok(value),
            Err(e) => return Err(PreprocessError::JsCallback(js_reason(&e))),
        };
        match resolved {
            Ok(Some(v)) => match v.into_processed() {
                Ok(processed) => Ok(processed),
                // These read as V8 messages because they are: upstream reaches
                // each one by operating on the value it was handed, and matching
                // it is what makes rsvelte substitutable here.
                // Upstream's markup path only reads `code` when it rebuilds the
                // document, so a result without one changes nothing — and on the
                // tag path the message names which of the two absent values it
                // was, so they cannot share an arm.
                Err(slot @ (CodeSlot::Missing | CodeSlot::Null)) => match callsite {
                    Callsite::Markup => Ok(None),
                    Callsite::Tag => Err(PreprocessError::JsCallback(format!(
                        "Cannot read properties of {} (reading 'replace')",
                        if matches!(slot, CodeSlot::Null) {
                            "null"
                        } else {
                            "undefined"
                        }
                    ))),
                },
                Err(CodeSlot::NotAString) => Err(PreprocessError::JsCallback(
                    match callsite {
                        Callsite::Markup => "source.split is not a function",
                        Callsite::Tag => "processed.code.replace is not a function",
                    }
                    .into(),
                )),
                Err(CodeSlot::Text(_)) => unreachable!("Text is the Ok arm"),
            },
            Ok(None) => Ok(None),
            Err(e) => Err(PreprocessError::JsCallback(js_reason(&e))),
        }
    }

    /// The JS contract permits source-map objects such as Sass's `SourceMapGenerator`,
    /// whose `toString` is a function. Decode only the fields we consume instead of
    /// asking napi-rs to JSON-serialize the entire user-controlled return object.
    /// What the preprocessor put in `code`. Upstream reaches its error through
    /// whichever operation it tries on the value, so the three cases are three
    /// different messages rather than one "invalid result".
    pub enum CodeSlot {
        Missing,
        Null,
        NotAString,
        Text(String),
    }

    pub struct JsProcessed {
        code: CodeSlot,
        map: Option<SourceMapInput>,
        dependencies: Vec<String>,
        attributes: Option<RsAttrMap>,
    }

    impl JsProcessed {
        fn into_processed(self) -> Result<Option<Processed>, CodeSlot> {
            match self.code {
                CodeSlot::Text(code) => Ok(Some(Processed {
                    code,
                    map: self.map,
                    dependencies: self.dependencies,
                    attributes: self.attributes,
                })),
                other => Err(other),
            }
        }
    }

    impl FromNapiValue for JsProcessed {
        unsafe fn from_napi_value(
            env: napi::sys::napi_env,
            napi_val: napi::sys::napi_value,
        ) -> napi::Result<Self> {
            let obj = Object::from_raw(env, napi_val);
            let code = match obj
                .get::<napi::bindgen_prelude::Unknown>("code")?
                .map(|value| value.get_type())
                .transpose()?
            {
                None | Some(napi::ValueType::Undefined) => CodeSlot::Missing,
                Some(napi::ValueType::Null) => CodeSlot::Null,
                Some(napi::ValueType::String) => obj
                    .get::<String>("code")?
                    .map_or(CodeSlot::Missing, CodeSlot::Text),
                Some(_) => CodeSlot::NotAString,
            };
            let map = obj
                .get::<JsSourceMap>("map")?
                .and_then(JsSourceMap::into_input);
            let dependencies = obj.get::<Vec<String>>("dependencies")?.unwrap_or_default();
            let attributes = obj
                .get::<Value>("attributes")?
                .as_ref()
                .and_then(json_to_attributes);
            Ok(Self {
                code,
                map,
                dependencies,
                attributes,
            })
        }
    }

    enum JsSourceMap {
        Json(Value),
        Stringified(String),
    }

    impl JsSourceMap {
        fn into_input(self) -> Option<SourceMapInput> {
            match self {
                Self::Json(value) => json_to_sourcemap_input(&value),
                Self::Stringified(json) => json_to_sourcemap_input(&Value::String(json)),
            }
        }
    }

    impl FromNapiValue for JsSourceMap {
        unsafe fn from_napi_value(
            env: napi::sys::napi_env,
            napi_val: napi::sys::napi_value,
        ) -> napi::Result<Self> {
            // SAFETY: Node passed this valid value to `FromNapiValue`.
            if let Ok(value) = unsafe { Value::from_napi_value(env, napi_val) } {
                return Ok(Self::Json(value));
            }

            let obj = Object::from_raw(env, napi_val);
            let stringify = obj
                .get::<napi::bindgen_prelude::Function<(), String>>("toString")?
                .ok_or_else(|| {
                    napi::Error::from_reason(
                        "preprocessor source map is neither JSON-serializable nor stringifiable",
                    )
                })?;
            Ok(Self::Stringified(stringify.apply(obj, ())?))
        }
    }

    fn attrs_to_json(attrs: &RsAttrMap) -> Value {
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

    fn json_to_sourcemap_input(val: &Value) -> Option<SourceMapInput> {
        match val {
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

    fn json_to_attributes(val: &Value) -> Option<RsAttrMap> {
        let obj = val.as_object()?;
        let mut out = RsAttrMap::default();
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

    pub fn processed_to_json(p: Processed) -> Value {
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

/// `compile()` variant that avoids `serde_json` on the Rust↔JS boundary.
///
/// The generated code and sourcemap JSON are handed to V8 as
/// `Buffer`s (zero-copy from the underlying `Vec<u8>`), so napi-rs
/// performs a single `ArrayBuffer` wrap per payload instead of a UTF-16
/// string copy. Warnings stay as a structured `#[napi(object)]` since
/// they're small and the JS side reads them eagerly.
///
/// # Errors
///
/// Returns an error when option conversion or compilation fails.
#[allow(
    clippy::needless_pass_by_value,
    reason = "napi-rs owns JavaScript arguments at the exported ABI boundary"
)]
#[napi(js_name = "compileBuffers", catch_unwind)]
pub fn napi_compile_buffers(
    env: Env,
    source: String,
    options: Option<NapiCompileOptionsArg>,
) -> napi::Result<CompileBuffersResult> {
    let opts = options_to_compile(Some(&env), options)?;
    reject_modern_ast_for_binary_result(&opts, "compileBuffers")?;
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
            warnings: result
                .warnings
                .into_iter()
                .map(warning_to_napi)
                .collect::<napi::Result<Vec<_>>>()?,
            runes: result.metadata.runes,
        }),
        Err(e) => Err(napi::Error::from_reason(format!("{e:?}"))),
    }
}

/// `compileModule()` variant matching `compileBuffers`'s output shape.
///
/// # Errors
///
/// Returns an error when option conversion or compilation fails.
#[allow(
    clippy::needless_pass_by_value,
    reason = "napi-rs owns JavaScript arguments at the exported ABI boundary"
)]
#[napi(js_name = "compileModuleBuffers", catch_unwind)]
pub fn napi_compile_module_buffers(
    env: Env,
    source: String,
    options: Option<NapiModuleCompileOptionsArg>,
) -> napi::Result<CompileBuffersResult> {
    let opts = options_to_module_compile(Some(&env), options)?;

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

fn warning_to_napi(w: rsvelte_core::compiler::Warning) -> napi::Result<NapiWarning> {
    Ok(NapiWarning {
        code: w.code,
        message: w.message,
        filename: w.filename,
        start: w.start.as_ref().map(position_to_napi).transpose()?,
        end: w.end.as_ref().map(position_to_napi).transpose()?,
        frame: w.frame,
    })
}

fn position_to_napi(p: &rsvelte_core::compiler::Position) -> napi::Result<NapiPosition> {
    Ok(NapiPosition {
        line: napi_u32(p.line)?,
        column: napi_u32(p.column)?,
        character: napi_u32(p.character)?,
    })
}

// =============================================================================
// Raw transfer — Step 2: Single binary envelope (one Buffer, lazy decode in JS)
// =============================================================================
//
// `compileEnvelope` packs the entire `CompileResult` into one
// fixed-layout byte buffer (`rsvelte_bindings_support::napi_raw`) and hands it to V8 as
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
    rsvelte_bindings_support::napi_raw::check_envelope_size(size).map_err(|size| {
        napi::Error::from_reason(format!(
            "rsvelte: compiled output is {size} bytes, exceeding the \
             {max}-byte envelope limit (header offsets are u32)",
            max = rsvelte_bindings_support::napi_raw::MAX_ENVELOPE_SIZE
        ))
    })
}

#[inline]
fn reject_modern_ast_for_binary_result(options: &CompileOptions, api: &str) -> napi::Result<()> {
    if options.modern_ast {
        return Err(napi::Error::from_reason(format!(
            "rsvelte: modernAst is not supported by {api}; use compile() instead"
        )));
    }
    Ok(())
}

/// `compile()` returning a single packed envelope buffer.
/// See `rsvelte_bindings_support::napi_raw` for the byte-level format.
///
/// # Errors
///
/// Returns an error when option conversion, compilation, or envelope encoding fails.
#[allow(
    clippy::needless_pass_by_value,
    reason = "napi-rs owns JavaScript arguments at the exported ABI boundary"
)]
#[napi(js_name = "compileEnvelope", catch_unwind)]
pub fn napi_compile_envelope(
    env: Env,
    source: String,
    options: Option<NapiCompileOptionsArg>,
) -> napi::Result<Buffer> {
    let opts = options_to_compile(Some(&env), options)?;
    let filename = opts.filename.clone();
    compile_envelope(env, &source, filename.as_deref(), opts, false)
}

/// Compiles with externalized source-map contents.
///
/// # Errors
///
/// Returns an error when option conversion, compilation, or envelope encoding fails.
#[allow(
    clippy::needless_pass_by_value,
    reason = "napi-rs owns JavaScript arguments at the exported ABI boundary"
)]
#[napi(js_name = "compileEnvelopeExternalSources", catch_unwind)]
pub fn napi_compile_envelope_external_sources(
    env: Env,
    source: String,
    options: Option<NapiCompileOptionsArg>,
) -> napi::Result<Buffer> {
    let opts = options_to_compile(Some(&env), options)?;
    let filename = opts.filename.clone();
    compile_envelope(env, &source, filename.as_deref(), opts, true)
}

fn compile_envelope(
    env: Env,
    source: &str,
    filename: Option<&str>,
    options: CompileOptions,
    externalize_sourcemap_content: bool,
) -> napi::Result<Buffer> {
    reject_modern_ast_for_binary_result(&options, "compileEnvelope")?;
    let result = if externalize_sourcemap_content {
        rust_compile_with_external_sourcemap_content(source, options)
    } else {
        rust_compile(source, options)
    };
    match result {
        Ok(result) => {
            ensure_envelope_size(rsvelte_bindings_support::napi_raw::estimate_size(&result))?;
            Ok(Buffer::from(
                rsvelte_bindings_support::napi_raw::encode_to_vec(&result),
            ))
        }
        Err(error) => Err(compile_error(env, source, filename, &error)),
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

fn create_zero_copy_envelope(
    env: Env,
    result: &rsvelte_core::compiler::CompileResult,
) -> napi::Result<JsBuffer> {
    let size = rsvelte_bindings_support::napi_raw::estimate_size(result);
    ensure_envelope_size(size)?;
    let bump = Box::new(bumpalo::Bump::with_capacity(size));
    let bump_ptr: *mut bumpalo::Bump = Box::into_raw(bump);

    // RAII guard: if we return early (e.g. `create_buffer_with_borrowed_data`
    // errors) or unwind before ownership is handed to V8's finalizer, free the
    // leaked arena instead of abandoning it (H-015). On success we disarm it so
    // only the finalizer frees the arena.
    let mut guard = BumpGuard(bump_ptr);

    // SAFETY: bump_ptr is freshly leaked from Box::into_raw and not
    // aliased; we re-acquire ownership via Box::from_raw inside the
    // finalizer below.
    let bump_ref: &bumpalo::Bump = unsafe { &*bump_ptr };
    let slice = rsvelte_bindings_support::napi_raw::encode_into_bump(bump_ref, result);
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

/// Zero-copy variant of [`napi_compile_envelope`].
///
/// It allocates envelope bytes in a `bumpalo::Bump` and releases the arena from
/// the V8 Buffer finalizer.
///
/// # Errors
///
/// Returns an error when option conversion, compilation, or buffer creation fails.
#[allow(
    clippy::needless_pass_by_value,
    reason = "napi-rs owns JavaScript arguments at the exported ABI boundary"
)]
#[napi(js_name = "compileEnvelopeZeroCopy", catch_unwind)]
pub fn napi_compile_envelope_zero_copy(
    env: Env,
    source: String,
    options: Option<NapiCompileOptionsArg>,
) -> napi::Result<JsBuffer> {
    let opts = options_to_compile(Some(&env), options)?;
    reject_modern_ast_for_binary_result(&opts, "compileEnvelopeZeroCopy")?;
    let result = match rust_compile(&source, opts) {
        Ok(r) => r,
        Err(e) => return Err(napi::Error::from_reason(format!("{e:?}"))),
    };
    create_zero_copy_envelope(env, &result)
}

/// `compileModule` counterpart of `compileEnvelopeZeroCopy`.
///
/// # Errors
///
/// Returns an error when option conversion, compilation, or buffer creation fails.
#[allow(
    clippy::needless_pass_by_value,
    reason = "napi-rs owns JavaScript arguments at the exported ABI boundary"
)]
#[napi(js_name = "compileModuleEnvelopeZeroCopy", catch_unwind)]
pub fn napi_compile_module_envelope_zero_copy(
    env: Env,
    source: String,
    options: Option<NapiModuleCompileOptionsArg>,
) -> napi::Result<JsBuffer> {
    let opts = options_to_module_compile(Some(&env), options)?;
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
    create_zero_copy_envelope(env, &cr)
}

/// `compileModule()` returning the same packed envelope. The envelope
/// uses the empty-CSS / empty-warnings encoding, so the JS decoder is
/// identical for both entry points.
///
/// # Errors
///
/// Returns an error when option conversion, compilation, or envelope encoding fails.
#[allow(
    clippy::needless_pass_by_value,
    reason = "napi-rs owns JavaScript arguments at the exported ABI boundary"
)]
#[napi(js_name = "compileModuleEnvelope", catch_unwind)]
pub fn napi_compile_module_envelope(
    env: Env,
    source: String,
    options: Option<NapiModuleCompileOptionsArg>,
) -> napi::Result<Buffer> {
    let opts = options_to_module_compile(Some(&env), options)?;
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
            ensure_envelope_size(rsvelte_bindings_support::napi_raw::estimate_size(&cr))?;
            Ok(Buffer::from(
                rsvelte_bindings_support::napi_raw::encode_to_vec(&cr),
            ))
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
// one batch envelope (`rsvelte_bindings_support::napi_raw::encode_batch_to_vec`). One
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
    pub options: Option<NapiCompileOptionsArg>,
}

/// Compile multiple Svelte components in parallel via rayon, packing
/// the results into one batch envelope. See
/// `crates/rsvelte_bindings_support/src/napi_raw.rs` for the
/// byte format.
///
/// # Errors
///
/// Returns an error when options or envelope encoding are invalid.
#[napi(js_name = "compileBatch", catch_unwind)]
pub fn napi_compile_batch(env: Env, inputs: Vec<CompileBatchInput>) -> napi::Result<Buffer> {
    compile_batch_envelope(&env, inputs, false)
}

/// Batch-compiles with externalized source-map contents.
///
/// # Errors
///
/// Returns an error when options or envelope encoding are invalid.
#[napi(js_name = "compileBatchExternalSources", catch_unwind)]
pub fn napi_compile_batch_external_sources(
    env: Env,
    inputs: Vec<CompileBatchInput>,
) -> napi::Result<Buffer> {
    compile_batch_envelope(&env, inputs, true)
}

fn compile_batch_envelope(
    env: &Env,
    inputs: Vec<CompileBatchInput>,
    externalize_sourcemap_content: bool,
) -> napi::Result<Buffer> {
    // Convert each entry's typed options up front. The conversion is
    // pure (no NAPI touchpoint) so it could in principle run in
    // parallel, but the per-call work is trivial and this keeps the
    // rayon stage focused on the actual compile.
    let parsed: Vec<(String, rsvelte_core::compiler::CompileOptions)> = inputs
        .into_iter()
        .map(|item| Ok((item.source, options_to_compile(Some(env), item.options)?)))
        .collect::<napi::Result<_>>()?;
    for (_, options) in &parsed {
        reject_modern_ast_for_binary_result(options, "compileBatch")?;
    }

    // Compile in parallel. `compile_batch` takes `&[(&str, CompileOptions)]`,
    // so we materialise the borrowed view once.
    let borrowed: Vec<(&str, rsvelte_core::compiler::CompileOptions)> = parsed
        .iter()
        .map(|(s, o)| (s.as_str(), o.clone()))
        .collect();
    let results = if externalize_sourcemap_content {
        rsvelte_core::compiler::compile_batch_with_external_sourcemap_content(&borrowed)
    } else {
        rsvelte_core::compiler::compile_batch(&borrowed)
    };

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

    let entries: Vec<rsvelte_bindings_support::napi_raw::BatchEntry<'_>> = results
        .iter()
        .zip(err_strings.iter())
        .map(|(result, error)| {
            result.as_ref().map_or_else(
                |_| {
                    rsvelte_bindings_support::napi_raw::BatchEntry::Err(
                        error.as_deref().unwrap_or("unknown error"),
                    )
                },
                rsvelte_bindings_support::napi_raw::BatchEntry::Ok,
            )
        })
        .collect();

    ensure_envelope_size(rsvelte_bindings_support::napi_raw::estimate_batch_size(
        &entries,
    ))?;
    Ok(Buffer::from(
        rsvelte_bindings_support::napi_raw::encode_batch_to_vec(&entries),
    ))
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
    filename: Option<String>,
    options: CompileOptions,
    externalize_sourcemap_content: bool,
}

impl Task for CompileEnvelopeTask {
    type Output = Result<Vec<u8>, rsvelte_core::compiler::CompileError>;
    type JsValue = Buffer;

    fn compute(&mut self) -> napi::Result<Self::Output> {
        // `std::mem::take(&mut self.options)` would be ideal, but
        // `CompileOptions` isn't `Default`-cheap (the css_hash Arc
        // field has to be re-Arc'd). Clone is fine here — options are
        // small and we only pay it once per call.
        let result = if self.externalize_sourcemap_content {
            rust_compile_with_external_sourcemap_content(&self.source, self.options.clone())
        } else {
            rust_compile(&self.source, self.options.clone())
        };
        match result {
            Ok(result) => {
                ensure_envelope_size(rsvelte_bindings_support::napi_raw::estimate_size(&result))?;
                Ok(Ok(rsvelte_bindings_support::napi_raw::encode_to_vec(
                    &result,
                )))
            }
            Err(error) => Ok(Err(error)),
        }
    }

    fn resolve(&mut self, env: napi::Env, output: Self::Output) -> napi::Result<Self::JsValue> {
        match output {
            Ok(output) => Ok(Buffer::from(output)),
            Err(error) => Err(compile_error(
                env,
                &self.source,
                self.filename.as_deref(),
                &error,
            )),
        }
    }
}

/// Async variant of `compileEnvelope` — returns `Promise<Buffer>` to
/// the JS caller, frees the JS event loop while rayon / the worker
/// thread runs the compile.
///
/// # Errors
///
/// Returns an error when option conversion fails.
#[allow(
    clippy::needless_pass_by_value,
    reason = "napi-rs owns JavaScript arguments at the exported ABI boundary"
)]
#[napi(js_name = "compileEnvelopeAsync", catch_unwind)]
pub fn napi_compile_envelope_async(
    env: Env,
    source: String,
    options: Option<NapiCompileOptionsArg>,
) -> napi::Result<AsyncTask<CompileEnvelopeTask>> {
    let options = options_to_compile(Some(&env), options)?;
    reject_modern_ast_for_binary_result(&options, "compileEnvelopeAsync")?;
    Ok(AsyncTask::new(CompileEnvelopeTask {
        source,
        filename: options.filename.clone(),
        options,
        externalize_sourcemap_content: false,
    }))
}

/// Async compile with externalized source-map contents.
///
/// # Errors
///
/// Returns an error when option conversion fails.
#[allow(
    clippy::needless_pass_by_value,
    reason = "napi-rs owns JavaScript arguments at the exported ABI boundary"
)]
#[napi(js_name = "compileEnvelopeExternalSourcesAsync", catch_unwind)]
pub fn napi_compile_envelope_external_sources_async(
    env: Env,
    source: String,
    options: Option<NapiCompileOptionsArg>,
) -> napi::Result<AsyncTask<CompileEnvelopeTask>> {
    let options = options_to_compile(Some(&env), options)?;
    reject_modern_ast_for_binary_result(&options, "compileEnvelopeExternalSourcesAsync")?;
    Ok(AsyncTask::new(CompileEnvelopeTask {
        source,
        filename: options.filename.clone(),
        options,
        externalize_sourcemap_content: true,
    }))
}

/// Async variant of `compileBatch` — same `compile_batch` (rayon
/// `par_iter`) on the worker thread, same RSVB envelope back.
pub struct CompileBatchTask {
    inputs: Vec<(String, CompileOptions)>,
    externalize_sourcemap_content: bool,
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
        let results = if self.externalize_sourcemap_content {
            rsvelte_core::compiler::compile_batch_with_external_sourcemap_content(&borrowed)
        } else {
            rsvelte_core::compiler::compile_batch(&borrowed)
        };
        let err_strings: Vec<Option<String>> = results
            .iter()
            .map(|r| match r {
                Ok(_) => None,
                Err(e) => Some(format!("{e:?}")),
            })
            .collect();
        let entries: Vec<rsvelte_bindings_support::napi_raw::BatchEntry<'_>> = results
            .iter()
            .zip(err_strings.iter())
            .map(|(result, error)| {
                result.as_ref().map_or_else(
                    |_| {
                        rsvelte_bindings_support::napi_raw::BatchEntry::Err(
                            error.as_deref().unwrap_or("unknown error"),
                        )
                    },
                    rsvelte_bindings_support::napi_raw::BatchEntry::Ok,
                )
            })
            .collect();
        ensure_envelope_size(rsvelte_bindings_support::napi_raw::estimate_batch_size(
            &entries,
        ))?;
        Ok(rsvelte_bindings_support::napi_raw::encode_batch_to_vec(
            &entries,
        ))
    }

    fn resolve(&mut self, _env: napi::Env, output: Self::Output) -> napi::Result<Self::JsValue> {
        Ok(Buffer::from(output))
    }
}

/// Starts an asynchronous batch compile.
///
/// # Errors
///
/// Returns an error when option conversion fails.
#[napi(js_name = "compileBatchAsync", catch_unwind)]
pub fn napi_compile_batch_async(
    env: Env,
    inputs: Vec<CompileBatchInput>,
) -> napi::Result<AsyncTask<CompileBatchTask>> {
    compile_batch_async_task(&env, inputs, false)
}

/// Starts an asynchronous batch compile with externalized source-map contents.
///
/// # Errors
///
/// Returns an error when option conversion fails.
#[napi(js_name = "compileBatchExternalSourcesAsync", catch_unwind)]
pub fn napi_compile_batch_external_sources_async(
    env: Env,
    inputs: Vec<CompileBatchInput>,
) -> napi::Result<AsyncTask<CompileBatchTask>> {
    compile_batch_async_task(&env, inputs, true)
}

fn compile_batch_async_task(
    env: &Env,
    inputs: Vec<CompileBatchInput>,
    externalize_sourcemap_content: bool,
) -> napi::Result<AsyncTask<CompileBatchTask>> {
    let parsed: Vec<(String, CompileOptions)> = inputs
        .into_iter()
        .map(|item| Ok((item.source, options_to_compile(Some(env), item.options)?)))
        .collect::<napi::Result<_>>()?;
    for (_, options) in &parsed {
        reject_modern_ast_for_binary_result(options, "compileBatchAsync")?;
    }
    Ok(AsyncTask::new(CompileBatchTask {
        inputs: parsed,
        externalize_sourcemap_content,
    }))
}
