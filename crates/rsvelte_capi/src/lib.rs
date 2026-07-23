//! rsvelte C ABI
//!
//! Universal FFI surface for the rsvelte Svelte compiler. Every input
//! and output crosses the boundary as a UTF-8 JSON byte slice with an
//! explicit length, so any language with a C FFI can drive it without
//! depending on a generated schema.
//!
//! # Memory model
//!
//! - All input buffers are borrowed for the duration of the call.
//! - All output buffers are heap-allocated by this library and MUST be
//!   released by the caller with [`rsvelte_free`].
//! - [`rsvelte_version`] returns a pointer into a static, NUL-terminated
//!   string that the caller must NOT free.
//!
//! # JSON shapes
//!
//! Input options match the existing N-API surface in `src/napi.rs`
//! (camelCase fields, all optional). Output is always:
//!
//! ```json
//! { "ok": true,  "result": { "js": {...}, "css": {...} | null, "warnings": [...], "metadata": {...} } }
//! ```
//! or
//! ```json
//! { "ok": false, "error":  { "message": "..." } }
//! ```

use std::os::raw::{c_char, c_void};

use rsvelte_core::compiler::{
    CompileOptions, CssHashInput, CssMode, ExperimentalOptions, GenerateMode, ModuleCompileOptions,
    Namespace, Warning, compile as rust_compile, compile_module as rust_compile_module,
};
use serde::Deserialize;
use serde_json::Value;

/// Owned byte buffer crossing the FFI boundary.
///
/// Layout-stable on every platform we care about (pointer + length).
/// The caller MUST release every non-null buffer returned by this
/// library with [`rsvelte_free`].
#[repr(C)]
pub struct RsvelteBuf {
    /// Pointer to UTF-8 bytes. May be null when `len == 0`.
    pub data: *mut u8,
    /// Length in bytes (does NOT include any trailing NUL).
    pub len: usize,
    /// Allocated capacity in bytes. Reserved for [`rsvelte_free`]; do
    /// not interpret in caller code.
    pub cap: usize,
}

impl RsvelteBuf {
    const EMPTY: Self = Self {
        data: std::ptr::null_mut(),
        len: 0,
        cap: 0,
    };

    fn from_vec(mut v: Vec<u8>) -> Self {
        let data = v.as_mut_ptr();
        let len = v.len();
        let cap = v.capacity();
        std::mem::forget(v);
        Self { data, len, cap }
    }
}

/// Borrowed UTF-8 string view returned by a callback into this library.
///
/// Unlike [`RsvelteBuf`], the library does NOT take ownership of these
/// bytes and never frees them. The pointer must stay valid only for the
/// duration of the callback invocation that returned it (this library
/// copies the bytes synchronously before the callback returns control
/// upstream). A `{ data: NULL, len: 0 }` value means "no value — fall
/// back to the compiler default".
#[repr(C)]
pub struct RsvelteStr {
    /// Pointer to borrowed UTF-8 bytes. NULL means "no value".
    pub data: *const u8,
    /// Length in bytes (does NOT include any trailing NUL).
    pub len: usize,
}

/// Input handed to a [`RsvelteCssHashFn`] callback.
///
/// Every field is a borrowed `(pointer, length)` UTF-8 slice, valid only
/// for the duration of the callback. `hash` is the raw digest of `css`
/// (the compiler's default scope digest, WITHOUT the `svelte-` prefix) —
/// prepend `svelte-` yourself to reproduce the default class name. It is
/// exactly the value the compiler's own default `cssHash` receives.
#[repr(C)]
pub struct RsvelteCssHashInput {
    /// The component's CSS source.
    pub css: *const u8,
    /// Length of `css` in bytes.
    pub css_len: usize,
    /// The rootDir-relative (or absolute) filename, or `(unknown)`.
    pub filename: *const u8,
    /// Length of `filename` in bytes.
    pub filename_len: usize,
    /// The derived component name.
    pub name: *const u8,
    /// Length of `name` in bytes.
    pub name_len: usize,
    /// The raw digest of `css` (no `svelte-` prefix).
    pub hash: *const u8,
    /// Length of `hash` in bytes.
    pub hash_len: usize,
}

/// A `cssHash` callback: `(userdata, input) -> class name`.
///
/// Returns the CSS scope class name as a borrowed [`RsvelteStr`]. Return
/// `{ NULL, 0 }` to fall back to the compiler's default hash. The
/// returned bytes must stay valid until the callback returns; this
/// library copies them immediately.
pub type RsvelteCssHashFn =
    extern "C" fn(userdata: *mut c_void, input: *const RsvelteCssHashInput) -> RsvelteStr;

/// A `warningFilter` callback: `(userdata, warning_json) -> keep`.
///
/// `warning_json` is a borrowed `(pointer, length)` UTF-8 JSON object
/// (`{ code, message, filename?, start?, end?, position?, frame? }`),
/// matching the warnings in the compile envelope. Return `true` to keep
/// the warning, `false` to drop it.
pub type RsvelteWarningFilterFn =
    extern "C" fn(userdata: *mut c_void, warning_json: *const u8, warning_json_len: usize) -> bool;

/// Optional compile callbacks (issue #1680).
///
/// Passed by pointer to the `*_with_callbacks` entry points. A NULL
/// function-pointer field disables that callback. Each `*_userdata`
/// pointer is passed back verbatim to its callback and is otherwise
/// opaque to this library — use it to carry closure state. When a
/// constant `cssHashOverride` is also set in the options JSON, that
/// constant wins and `css_hash` is not invoked (mirrors the wasm/NAPI
/// precedence).
#[repr(C)]
pub struct RsvelteCallbacks {
    /// CSS hash callback (a [`RsvelteCssHashFn`]), or NULL. Inlined rather
    /// than referenced via the alias so cbindgen emits a nullable function
    /// pointer instead of an opaque `Option_*` struct.
    pub css_hash: Option<
        extern "C" fn(userdata: *mut c_void, input: *const RsvelteCssHashInput) -> RsvelteStr,
    >,
    /// Opaque state pointer passed to `css_hash`.
    pub css_hash_userdata: *mut c_void,
    /// Warning filter callback (a [`RsvelteWarningFilterFn`]), or NULL.
    pub warning_filter: Option<
        extern "C" fn(
            userdata: *mut c_void,
            warning_json: *const u8,
            warning_json_len: usize,
        ) -> bool,
    >,
    /// Opaque state pointer passed to `warning_filter`.
    pub warning_filter_userdata: *mut c_void,
}

/// Opaque userdata pointer made `Send + Sync` so the callback closures
/// satisfy the compiler's `CssHashFn` / `WarningFilterFn` bounds. The
/// pointer is only ever dereferenced inside the caller's own callback,
/// which the caller is responsible for making thread-safe.
#[derive(Clone, Copy)]
struct Userdata(*mut c_void);

impl Userdata {
    // A method (rather than a bare `.0` field access) so closures capture the
    // whole `Userdata` (which is `Send + Sync`) instead of the raw pointer field
    // under Rust 2021 disjoint closure captures.
    fn get(&self) -> *mut c_void {
        self.0
    }
}

// SAFETY: the pointer is opaque to this library; thread-safety of any
// data it references is the caller's responsibility, exactly as for the
// callback function itself.
unsafe impl Send for Userdata {}
// SAFETY: see the `Send` impl above — same rationale.
unsafe impl Sync for Userdata {}

/// Library version (matches the `rsvelte_core` crate version).
///
/// Returns a static, NUL-terminated UTF-8 string. The caller MUST NOT
/// free the returned pointer.
#[unsafe(no_mangle)]
pub extern "C" fn rsvelte_version() -> *const c_char {
    // env! is evaluated at compile time; the string lives in .rodata.
    static VERSION: &str = concat!(env!("CARGO_PKG_VERSION"), "\0");
    VERSION.as_ptr() as *const c_char
}

/// Release a buffer previously returned by this library.
///
/// Safe to call with a zero-initialised buffer (data=NULL, len=0,
/// cap=0); does nothing in that case. Calling twice on the same
/// non-empty buffer is undefined behaviour.
///
/// # Safety
/// `buf` must be a value previously returned by an `rsvelte_*` call.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn rsvelte_free(buf: RsvelteBuf) {
    // SAFETY: upheld by this function's documented `# Safety` contract
    // (valid pointers/lengths and a writable out-pointer supplied by the caller).
    unsafe { rsvelte_free_raw(buf.data, buf.len, buf.cap) }
}

/// Decomposed-argument variant of [`rsvelte_free`] for hosts whose
/// FFI can't pass structs by value (Ruby Fiddle, some PHP setups).
///
/// # Safety
/// `(data, len, cap)` must be the three fields of a `RsvelteBuf`
/// previously returned by an `rsvelte_*` call.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn rsvelte_free_raw(data: *mut u8, len: usize, cap: usize) {
    if data.is_null() || cap == 0 {
        return;
    }
    // SAFETY: (data, len, cap) were produced by Vec::into_raw_parts via
    // RsvelteBuf::from_vec, and the caller contract is single ownership.
    unsafe {
        drop(Vec::from_raw_parts(data, len, cap));
    }
}

/// Compile a Svelte component.
///
/// Both inputs are borrowed for the duration of the call. The result
/// is a JSON envelope ({"ok":true,"result":...} or
/// {"ok":false,"error":...}). Returns an empty buffer on argument
/// errors *too severe to encode* (e.g. invalid source pointer) — every
/// recoverable error is reported inside the JSON envelope instead.
///
/// # Safety
/// - `source` must point to `source_len` valid UTF-8 bytes (or be NULL when len==0).
/// - `options_json` must point to `options_len` valid UTF-8 bytes (or be NULL when len==0).
///   When `options_len == 0` the compiler defaults are used.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn rsvelte_compile(
    source: *const u8,
    source_len: usize,
    options_json: *const u8,
    options_len: usize,
) -> RsvelteBuf {
    // SAFETY: upheld by this function's documented `# Safety` contract
    // (valid pointers/lengths and a writable out-pointer supplied by the caller).
    let Some(source_str) = (unsafe { borrow_utf8(source, source_len) }) else {
        return error_envelope("source is not valid UTF-8 or pointer is null");
    };
    // SAFETY: upheld by this function's documented `# Safety` contract
    // (valid pointers/lengths and a writable out-pointer supplied by the caller).
    let opts = match unsafe { parse_compile_options(options_json, options_len) } {
        Ok(o) => o,
        Err(msg) => return error_envelope(&msg),
    };

    match rust_compile(source_str, opts) {
        Ok(result) => success_envelope(compile_result_to_json(&result)),
        Err(e) => error_envelope(&format!("{e}")),
    }
}

/// Compile a Svelte `.svelte.js` / `.svelte.ts` module.
///
/// Same calling convention as [`rsvelte_compile`].
///
/// # Safety
/// See [`rsvelte_compile`].
#[unsafe(no_mangle)]
pub unsafe extern "C" fn rsvelte_compile_module(
    source: *const u8,
    source_len: usize,
    options_json: *const u8,
    options_len: usize,
) -> RsvelteBuf {
    // SAFETY: upheld by this function's documented `# Safety` contract
    // (valid pointers/lengths and a writable out-pointer supplied by the caller).
    let Some(source_str) = (unsafe { borrow_utf8(source, source_len) }) else {
        return error_envelope("source is not valid UTF-8 or pointer is null");
    };
    // SAFETY: upheld by this function's documented `# Safety` contract
    // (valid pointers/lengths and a writable out-pointer supplied by the caller).
    let opts = match unsafe { parse_module_options(options_json, options_len) } {
        Ok(o) => o,
        Err(msg) => return error_envelope(&msg),
    };

    match rust_compile_module(source_str, opts) {
        Ok(result) => success_envelope(compile_result_to_json(&result)),
        Err(e) => error_envelope(&format!("{e}")),
    }
}

/// Compile a Svelte component with optional `cssHash` / `warningFilter`
/// callbacks (issue #1680).
///
/// Identical to [`rsvelte_compile`] but also resolves the two callback
/// compile options that can't cross the JSON boundary. `callbacks` may
/// be NULL (equivalent to [`rsvelte_compile`]); individual callback
/// fields may be NULL too. The callbacks are input-only and are never
/// retained past this call.
///
/// # Safety
/// - Source/options pointers follow [`rsvelte_compile`]'s rules.
/// - `callbacks` must be NULL or point to a valid [`RsvelteCallbacks`];
///   each non-NULL function pointer must be callable with the documented
///   signature and its paired `*_userdata` value.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn rsvelte_compile_with_callbacks(
    source: *const u8,
    source_len: usize,
    options_json: *const u8,
    options_len: usize,
    callbacks: *const RsvelteCallbacks,
) -> RsvelteBuf {
    // SAFETY: upheld by this function's documented `# Safety` contract.
    let Some(source_str) = (unsafe { borrow_utf8(source, source_len) }) else {
        return error_envelope("source is not valid UTF-8 or pointer is null");
    };
    // SAFETY: upheld by this function's documented `# Safety` contract.
    let mut opts = match unsafe { parse_compile_options(options_json, options_len) } {
        Ok(o) => o,
        Err(msg) => return error_envelope(&msg),
    };
    // SAFETY: `callbacks` is NULL or a valid `RsvelteCallbacks` per the contract.
    unsafe { apply_component_callbacks(&mut opts, callbacks) };

    match rust_compile(source_str, opts) {
        Ok(result) => success_envelope(compile_result_to_json(&result)),
        Err(e) => error_envelope(&format!("{e}")),
    }
}

/// Compile a Svelte `.svelte.js` / `.svelte.ts` module with an optional
/// `warningFilter` callback (issue #1680). Modules have no CSS, so the
/// `css_hash` field of `callbacks` is ignored.
///
/// # Safety
/// See [`rsvelte_compile_with_callbacks`].
#[unsafe(no_mangle)]
pub unsafe extern "C" fn rsvelte_compile_module_with_callbacks(
    source: *const u8,
    source_len: usize,
    options_json: *const u8,
    options_len: usize,
    callbacks: *const RsvelteCallbacks,
) -> RsvelteBuf {
    // SAFETY: upheld by this function's documented `# Safety` contract.
    let Some(source_str) = (unsafe { borrow_utf8(source, source_len) }) else {
        return error_envelope("source is not valid UTF-8 or pointer is null");
    };
    // SAFETY: upheld by this function's documented `# Safety` contract.
    let mut opts = match unsafe { parse_module_options(options_json, options_len) } {
        Ok(o) => o,
        Err(msg) => return error_envelope(&msg),
    };
    // SAFETY: `callbacks` is NULL or a valid `RsvelteCallbacks` per the contract.
    unsafe { apply_module_callbacks(&mut opts, callbacks) };

    match rust_compile_module(source_str, opts) {
        Ok(result) => success_envelope(compile_result_to_json(&result)),
        Err(e) => error_envelope(&format!("{e}")),
    }
}

/// Out-parameter variant of [`rsvelte_compile`] for hosts whose FFI
/// can't return structs by value (e.g. Ruby Fiddle, older PHP, some
/// Java JNI setups). The result is written through `out`. The caller
/// still owns the bytes and must release them with [`rsvelte_free`].
///
/// # Safety
/// `out` must be a non-null pointer to a writable `RsvelteBuf`.
/// Source/options pointers follow the same rules as [`rsvelte_compile`].
#[unsafe(no_mangle)]
pub unsafe extern "C" fn rsvelte_compile_into(
    source: *const u8,
    source_len: usize,
    options_json: *const u8,
    options_len: usize,
    out: *mut RsvelteBuf,
) {
    if out.is_null() {
        return;
    }
    // SAFETY: upheld by this function's documented `# Safety` contract
    // (valid pointers/lengths and a writable out-pointer supplied by the caller).
    let buf = unsafe { rsvelte_compile(source, source_len, options_json, options_len) };
    // SAFETY: `out` was null-checked above and is a writable `RsvelteBuf` per the
    // caller's `# Safety` contract; `write` moves `buf` in without reading the old value.
    unsafe { std::ptr::write(out, buf) };
}

/// Out-parameter variant of [`rsvelte_compile_module`]. See
/// [`rsvelte_compile_into`] for the rationale.
///
/// # Safety
/// See [`rsvelte_compile_into`].
#[unsafe(no_mangle)]
pub unsafe extern "C" fn rsvelte_compile_module_into(
    source: *const u8,
    source_len: usize,
    options_json: *const u8,
    options_len: usize,
    out: *mut RsvelteBuf,
) {
    if out.is_null() {
        return;
    }
    // SAFETY: upheld by this function's documented `# Safety` contract
    // (valid pointers/lengths and a writable out-pointer supplied by the caller).
    let buf = unsafe { rsvelte_compile_module(source, source_len, options_json, options_len) };
    // SAFETY: `out` was null-checked above and is a writable `RsvelteBuf` per the
    // caller's `# Safety` contract; `write` moves `buf` in without reading the old value.
    unsafe { std::ptr::write(out, buf) };
}

// ---------------------------------------------------------------------------
// Helpers — not exported.
// ---------------------------------------------------------------------------

/// # Safety
/// `ptr` and `len` must describe a valid borrowed byte slice (or `len == 0`).
unsafe fn borrow_utf8<'a>(ptr: *const u8, len: usize) -> Option<&'a str> {
    if len == 0 {
        return Some("");
    }
    if ptr.is_null() {
        return None;
    }
    // SAFETY: caller-provided pointer/length form a valid borrowed slice.
    let bytes = unsafe { std::slice::from_raw_parts(ptr, len) };
    std::str::from_utf8(bytes).ok()
}

fn error_envelope(msg: &str) -> RsvelteBuf {
    let env = serde_json::json!({ "ok": false, "error": { "message": msg } });
    match serde_json::to_vec(&env) {
        Ok(v) => RsvelteBuf::from_vec(v),
        Err(_) => RsvelteBuf::EMPTY,
    }
}

fn success_envelope(result: Value) -> RsvelteBuf {
    let env = serde_json::json!({ "ok": true, "result": result });
    match serde_json::to_vec(&env) {
        Ok(v) => RsvelteBuf::from_vec(v),
        Err(e) => error_envelope(&format!("failed to serialize result: {e}")),
    }
}

// --- options parsing ------------------------------------------------------

#[derive(Debug, Deserialize, Default)]
#[serde(rename_all = "camelCase", default)]
struct CapiExperimentalOptions {
    r#async: Option<bool>,
}

#[derive(Debug, Deserialize, Default)]
#[serde(rename_all = "camelCase", default)]
struct CapiCompatibilityOptions {
    component_api: Option<u32>,
}

#[derive(Debug, Deserialize, Default)]
#[serde(rename_all = "camelCase", default)]
struct CapiCompileOptionsJson {
    dev: Option<bool>,
    generate: Option<String>,
    filename: Option<String>,
    root_dir: Option<String>,
    name: Option<String>,
    custom_element: Option<bool>,
    accessors: Option<bool>,
    namespace: Option<String>,
    immutable: Option<bool>,
    css: Option<String>,
    preserve_comments: Option<bool>,
    preserve_whitespace: Option<bool>,
    runes: Option<bool>,
    disclose_version: Option<bool>,
    sourcemap: Option<Value>,
    output_filename: Option<String>,
    css_output_filename: Option<String>,
    hmr: Option<bool>,
    modern_ast: Option<bool>,
    experimental: Option<CapiExperimentalOptions>,
    compatibility: Option<CapiCompatibilityOptions>,
    css_hash_override: Option<String>,
    fragments: Option<String>,
}

#[derive(Debug, Deserialize, Default)]
#[serde(rename_all = "camelCase", default)]
struct CapiModuleCompileOptionsJson {
    dev: Option<bool>,
    generate: Option<String>,
    filename: Option<String>,
    root_dir: Option<String>,
    experimental: Option<CapiExperimentalOptions>,
}

/// # Safety
/// See [`borrow_utf8`].
unsafe fn parse_compile_options(ptr: *const u8, len: usize) -> Result<CompileOptions, String> {
    let raw: CapiCompileOptionsJson = if len == 0 {
        CapiCompileOptionsJson::default()
    } else {
        // SAFETY: upheld by this function's documented `# Safety` contract
        // (valid pointers/lengths and a writable out-pointer supplied by the caller).
        let s = unsafe { borrow_utf8(ptr, len) }
            .ok_or_else(|| "options_json is not valid UTF-8".to_string())?;
        serde_json::from_str(s).map_err(|e| format!("options_json parse error: {e}"))?
    };

    let mut opts = CompileOptions::default();
    if let Some(v) = raw.dev {
        opts.dev = v;
    }
    if let Some(v) = raw.generate.as_deref() {
        opts.generate = match v {
            "server" | "ssr" => GenerateMode::Server,
            "false" => GenerateMode::None,
            _ => GenerateMode::Client,
        };
    }
    if let Some(v) = raw.filename {
        opts.filename = Some(v);
    }
    if let Some(v) = raw.root_dir {
        opts.root_dir = Some(v);
    } else if let Ok(cwd) = std::env::current_dir() {
        opts.root_dir = Some(cwd.to_string_lossy().to_string());
    }
    if let Some(v) = raw.name {
        opts.name = Some(v);
    }
    if let Some(v) = raw.custom_element {
        opts.custom_element = v;
    }
    if let Some(v) = raw.accessors {
        opts.accessors = v;
    }
    if let Some(v) = raw.namespace.as_deref() {
        opts.namespace = match v {
            "svg" => Namespace::Svg,
            "mathml" => Namespace::Mathml,
            _ => Namespace::Html,
        };
    }
    if let Some(v) = raw.immutable {
        opts.immutable = v;
    }
    if let Some(v) = raw.css.as_deref() {
        opts.css = match v {
            "injected" => CssMode::Injected,
            _ => CssMode::External,
        };
    }
    if let Some(v) = raw.preserve_comments {
        opts.preserve_comments = v;
    }
    if let Some(v) = raw.preserve_whitespace {
        opts.preserve_whitespace = v;
    }
    if let Some(v) = raw.runes {
        opts.runes = Some(v);
    }
    if let Some(v) = raw.disclose_version {
        opts.disclose_version = v;
    }
    if let Some(v) = raw.sourcemap {
        if let Some(s) = v.as_str() {
            opts.sourcemap = Some(s.to_string());
        } else if v.is_object() || v.is_array() {
            // Only carry the map through when it serializes; on failure
            // `.ok()` yields `None`, leaving the field unset rather than
            // storing an empty-string sourcemap.
            opts.sourcemap = serde_json::to_string(&v).ok();
        }
    }
    if let Some(v) = raw.output_filename {
        opts.output_filename = Some(v);
    }
    if let Some(v) = raw.css_output_filename {
        opts.css_output_filename = Some(v);
    }
    if let Some(v) = raw.hmr {
        opts.hmr = v;
    }
    if let Some(v) = raw.modern_ast {
        opts.modern_ast = v;
    }
    if let Some(exp) = raw.experimental
        && let Some(v) = exp.r#async
    {
        opts.experimental = ExperimentalOptions { r#async: v };
    }
    if let Some(compat) = raw.compatibility
        && let Some(v) = compat.component_api
    {
        opts.compatibility.component_api = if v == 4 {
            rsvelte_core::compiler::ComponentApi::V4
        } else {
            rsvelte_core::compiler::ComponentApi::V5
        };
    }
    if let Some(hash_override) = raw.css_hash_override {
        opts.css_hash = Some(std::sync::Arc::new(
            move |_: &rsvelte_core::compiler::CssHashInput| hash_override.clone(),
        ));
    }
    if let Some(v) = raw.fragments.as_deref() {
        opts.fragments = match v {
            "tree" => rsvelte_core::compiler::FragmentMode::Tree,
            _ => rsvelte_core::compiler::FragmentMode::Html,
        };
    }
    Ok(opts)
}

/// # Safety
/// See [`borrow_utf8`].
unsafe fn parse_module_options(ptr: *const u8, len: usize) -> Result<ModuleCompileOptions, String> {
    let raw: CapiModuleCompileOptionsJson = if len == 0 {
        CapiModuleCompileOptionsJson::default()
    } else {
        // SAFETY: upheld by this function's documented `# Safety` contract
        // (valid pointers/lengths and a writable out-pointer supplied by the caller).
        let s = unsafe { borrow_utf8(ptr, len) }
            .ok_or_else(|| "options_json is not valid UTF-8".to_string())?;
        serde_json::from_str(s).map_err(|e| format!("options_json parse error: {e}"))?
    };

    let mut opts = ModuleCompileOptions::default();
    if let Some(v) = raw.dev {
        opts.dev = v;
    }
    if let Some(v) = raw.generate.as_deref() {
        opts.generate = match v {
            "server" | "ssr" => GenerateMode::Server,
            "false" => GenerateMode::None,
            _ => GenerateMode::Client,
        };
    }
    if let Some(v) = raw.filename {
        opts.filename = Some(v);
    }
    if let Some(v) = raw.root_dir {
        opts.root_dir = Some(v);
    }
    if let Some(exp) = raw.experimental
        && let Some(v) = exp.r#async
    {
        opts.experimental = ExperimentalOptions { r#async: v };
    }
    Ok(opts)
}

// --- callback bridging ----------------------------------------------------

/// Reproduce the compiler's default (no-`cssHash`) scope hash, used when a
/// `css_hash` callback declines (returns `{ NULL, 0 }` or non-UTF-8): the
/// rootDir-relative filename when known, else the CSS content. Mirrors the
/// wasm bridge's `default_css_hash`.
fn default_css_hash(input: &CssHashInput, root_dir: Option<&str>) -> String {
    use rsvelte_core::compiler::phases::phase3_transform::css::generate_css_hash;
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

/// Wrap a `warningFilter` C callback into a core `WarningFilterFn`.
fn build_warning_filter(
    func: RsvelteWarningFilterFn,
    userdata: *mut c_void,
) -> impl Fn(&Warning) -> bool {
    let ud = Userdata(userdata);
    move |warning: &Warning| -> bool {
        let json = warning_to_value(warning).to_string();
        let bytes = json.as_bytes();
        // SAFETY: `func` is a valid extern fn per the caller's `RsvelteCallbacks`
        // contract; the JSON slice is valid for this synchronous call.
        func(ud.get(), bytes.as_ptr(), bytes.len())
    }
}

/// # Safety
/// `callbacks` must be NULL or point to a valid [`RsvelteCallbacks`].
unsafe fn apply_component_callbacks(opts: &mut CompileOptions, callbacks: *const RsvelteCallbacks) {
    if callbacks.is_null() {
        return;
    }
    // SAFETY: non-null and valid per the caller's contract.
    let cb = unsafe { &*callbacks };

    if let Some(func) = cb.warning_filter {
        let filter = build_warning_filter(func, cb.warning_filter_userdata);
        opts.warning_filter = Some(std::sync::Arc::new(filter));
    }

    // A constant `cssHashOverride` (already set by `parse_compile_options`)
    // wins; only bridge the dynamic callback when no override was supplied.
    if opts.css_hash.is_none()
        && let Some(func) = cb.css_hash
    {
        let ud = Userdata(cb.css_hash_userdata);
        let root_dir = opts.root_dir.clone();
        opts.css_hash = Some(std::sync::Arc::new(move |input: &CssHashInput| -> String {
            // Trust the shared raw digest (`CssHashInput::hash`, PR #1705): it is
            // already unprefixed, so the callback receives a raw hash and the
            // `svelte-` prefix is never doubled.
            let raw = (input.hash)(&input.css);
            let c_input = RsvelteCssHashInput {
                css: input.css.as_ptr(),
                css_len: input.css.len(),
                filename: input.filename.as_ptr(),
                filename_len: input.filename.len(),
                name: input.name.as_ptr(),
                name_len: input.name.len(),
                hash: raw.as_ptr(),
                hash_len: raw.len(),
            };
            // SAFETY: `func` is a valid extern fn per the caller's contract; the
            // borrowed slices in `c_input` outlive this synchronous call.
            let ret = func(ud.get(), &c_input);
            if ret.data.is_null() || ret.len == 0 {
                return default_css_hash(input, root_dir.as_deref());
            }
            // SAFETY: callback contract — `ret` borrows valid UTF-8 for this call.
            let bytes = unsafe { std::slice::from_raw_parts(ret.data, ret.len) };
            match std::str::from_utf8(bytes) {
                Ok(s) => s.to_string(),
                Err(_) => default_css_hash(input, root_dir.as_deref()),
            }
        }));
    }
}

/// # Safety
/// `callbacks` must be NULL or point to a valid [`RsvelteCallbacks`].
unsafe fn apply_module_callbacks(
    opts: &mut ModuleCompileOptions,
    callbacks: *const RsvelteCallbacks,
) {
    if callbacks.is_null() {
        return;
    }
    // SAFETY: non-null and valid per the caller's contract.
    let cb = unsafe { &*callbacks };
    if let Some(func) = cb.warning_filter {
        let filter = build_warning_filter(func, cb.warning_filter_userdata);
        opts.warning_filter = Some(std::sync::Arc::new(filter));
    }
}

// --- result encoding ------------------------------------------------------

/// Encode a single warning as the JSON object shared by the compile
/// envelope and the `warningFilter` callback.
fn warning_to_value(w: &Warning) -> Value {
    let mut map = serde_json::Map::new();
    map.insert("code".to_string(), Value::String(w.code.clone()));
    map.insert("message".to_string(), Value::String(w.message.clone()));
    if let Some(ref filename) = w.filename {
        map.insert("filename".to_string(), Value::String(filename.clone()));
    }
    if let Some(ref start) = w.start {
        map.insert(
            "start".to_string(),
            serde_json::json!({
                "line": start.line,
                "column": start.column,
                "character": start.character,
            }),
        );
    }
    if let Some(ref end) = w.end {
        map.insert(
            "end".to_string(),
            serde_json::json!({
                "line": end.line,
                "column": end.column,
                "character": end.character,
            }),
        );
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
}

fn compile_result_to_json(result: &rsvelte_core::compiler::CompileResult) -> Value {
    let js_obj = serde_json::json!({
        "code": result.js.code,
        "map": result
            .js
            .map
            .as_deref()
            .map(|m| serde_json::from_str::<Value>(m).unwrap_or(Value::Null))
            .unwrap_or(Value::Null),
    });

    let css_obj = result.css.as_ref().map(|c| {
        serde_json::json!({
            "code": c.code,
            "map": c
                .map
                .as_deref()
                .map(|m| serde_json::from_str::<Value>(m).unwrap_or(Value::Null))
                .unwrap_or(Value::Null),
            "hasGlobal": c.has_global,
        })
    });

    let warnings: Vec<Value> = result.warnings.iter().map(warning_to_value).collect();

    serde_json::json!({
        "js": js_obj,
        "css": css_obj,
        "warnings": warnings,
        "metadata": { "runes": result.metadata.runes },
    })
}
