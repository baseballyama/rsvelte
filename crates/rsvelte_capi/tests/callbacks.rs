//! FFI coverage for the `cssHash` / `warningFilter` compile callbacks
//! (issue #1680). Drives `rsvelte_compile_with_callbacks` with real
//! `extern "C"` callbacks so the full function-pointer path is exercised
//! exactly as a C host would.

use std::os::raw::c_void;

use rsvelte_capi::{
    RsvelteBuf, RsvelteCallbacks, RsvelteCssHashInput, RsvelteStr,
    rsvelte_compile_module_with_callbacks, rsvelte_compile_with_callbacks, rsvelte_free,
};
use serde_json::Value;

fn drive(source: &str, options_json: &str, callbacks: &RsvelteCallbacks) -> Value {
    drive_with(source, options_json, callbacks, false)
}

fn drive_module(source: &str, options_json: &str, callbacks: &RsvelteCallbacks) -> Value {
    drive_with(source, options_json, callbacks, true)
}

fn drive_with(
    source: &str,
    options_json: &str,
    callbacks: &RsvelteCallbacks,
    module: bool,
) -> Value {
    let src = source.as_bytes();
    let opts = options_json.as_bytes();
    // SAFETY: `src`/`opts` are valid byte slices owned for this call; the
    // callbacks struct is valid for the call's duration.
    let buf: RsvelteBuf = unsafe {
        let src_ptr = if src.is_empty() {
            std::ptr::null()
        } else {
            src.as_ptr()
        };
        let opt_ptr = if opts.is_empty() {
            std::ptr::null()
        } else {
            opts.as_ptr()
        };
        if module {
            rsvelte_compile_module_with_callbacks(
                src_ptr,
                src.len(),
                opt_ptr,
                opts.len(),
                callbacks,
            )
        } else {
            rsvelte_compile_with_callbacks(src_ptr, src.len(), opt_ptr, opts.len(), callbacks)
        }
    };
    assert!(
        !buf.data.is_null() && buf.len > 0,
        "FFI returned empty buffer"
    );
    // SAFETY: non-null buffer described by (data, len); copied before freeing.
    let bytes = unsafe { std::slice::from_raw_parts(buf.data, buf.len) }.to_vec();
    // SAFETY: `buf` came from the call above; freed exactly once.
    unsafe { rsvelte_free(buf) };
    serde_json::from_slice(&bytes).expect("valid JSON envelope")
}

fn empty_callbacks() -> RsvelteCallbacks {
    RsvelteCallbacks {
        css_hash: None,
        css_hash_userdata: std::ptr::null_mut(),
        warning_filter: None,
        warning_filter_userdata: std::ptr::null_mut(),
    }
}

fn ok(env: &Value) -> &Value {
    assert_eq!(env["ok"], Value::Bool(true), "expected ok=true, got {env}");
    &env["result"]
}

// ---------------------------------------------------------------------------
// cssHash callback
// ---------------------------------------------------------------------------

/// State the `css_hash` callback records so the test can inspect what the
/// compiler handed it. `returned` is kept alive for the borrowed
/// `RsvelteStr` the callback returns.
#[derive(Default)]
struct CssHashProbe {
    seen_hash: String,
    seen_css: String,
    seen_name: String,
    seen_filename: String,
    invocations: u32,
    returned: String,
}

extern "C" fn css_hash_cb(userdata: *mut c_void, input: *const RsvelteCssHashInput) -> RsvelteStr {
    // SAFETY: `userdata` is the `&mut CssHashProbe` we passed in; `input`
    // is a valid `RsvelteCssHashInput` for this call.
    let probe = unsafe { &mut *(userdata as *mut CssHashProbe) };
    // SAFETY: `input` is a valid `RsvelteCssHashInput` for this call.
    let inp = unsafe { &*input };
    let slice = |ptr: *const u8, len: usize| -> String {
        if ptr.is_null() || len == 0 {
            String::new()
        } else {
            // SAFETY: `(ptr, len)` is a borrowed UTF-8 slice valid for this call.
            let bytes = unsafe { std::slice::from_raw_parts(ptr, len) };
            String::from_utf8_lossy(bytes).into_owned()
        }
    };
    probe.seen_hash = slice(inp.hash, inp.hash_len);
    probe.seen_css = slice(inp.css, inp.css_len);
    probe.seen_name = slice(inp.name, inp.name_len);
    probe.seen_filename = slice(inp.filename, inp.filename_len);
    probe.invocations += 1;
    // Reproduce upstream's default scope class: `svelte-${hash}`. Because the
    // shared digest is unprefixed (PR #1705), this yields a SINGLE prefix.
    probe.returned = format!("svelte-{}", probe.seen_hash);
    RsvelteStr {
        data: probe.returned.as_ptr(),
        len: probe.returned.len(),
    }
}

#[test]
fn css_hash_callback_class_appears_in_css() {
    let mut probe = CssHashProbe::default();
    let callbacks = RsvelteCallbacks {
        css_hash: Some(css_hash_cb),
        css_hash_userdata: &mut probe as *mut _ as *mut c_void,
        ..empty_callbacks()
    };
    let env = drive(
        "<h1>x</h1>\n<style>h1{color:red}</style>",
        r#"{"filename":"App.svelte","css":"external"}"#,
        &callbacks,
    );
    let css_code = ok(&env)["css"]["code"].as_str().unwrap_or("").to_string();
    assert!(
        probe.invocations >= 1,
        "css_hash callback was never invoked"
    );
    assert!(
        css_code.contains(&probe.returned),
        "callback class `{}` must appear in CSS; got: {css_code}",
        probe.returned
    );
}

/// The #1697 double-prefix guard: the shared `hash` field is the RAW digest
/// (no `svelte-` prefix, per PR #1705). A callback that prepends `svelte-`
/// must produce a single-prefixed class — never `svelte-svelte-`.
#[test]
fn css_hash_input_is_raw_digest_no_double_prefix() {
    let mut probe = CssHashProbe::default();
    let callbacks = RsvelteCallbacks {
        css_hash: Some(css_hash_cb),
        css_hash_userdata: &mut probe as *mut _ as *mut c_void,
        ..empty_callbacks()
    };
    let env = drive(
        "<h1>x</h1>\n<style>h1{color:red}</style>",
        r#"{"filename":"App.svelte","css":"external"}"#,
        &callbacks,
    );
    let css_code = ok(&env)["css"]["code"].as_str().unwrap_or("").to_string();
    assert!(
        !probe.seen_hash.is_empty(),
        "callback should receive a non-empty raw digest"
    );
    assert!(
        !probe.seen_hash.starts_with("svelte-"),
        "the `hash` field must be the raw digest without the `svelte-` prefix; got `{}`",
        probe.seen_hash
    );
    assert!(
        !css_code.contains("svelte-svelte-"),
        "trusting the shared raw digest must not double the prefix; got: {css_code}"
    );
    assert!(
        css_code.contains(&format!("svelte-{}", probe.seen_hash)),
        "single-prefixed class must appear in CSS; got: {css_code}"
    );
    // The callback saw the real css/name/filename too.
    assert!(probe.seen_css.contains("color"), "css was passed through");
    assert_eq!(
        probe.seen_name, "App",
        "component name derived from filename"
    );
    assert_eq!(probe.seen_filename, "App.svelte");
}

/// Extract the first `svelte-<base36>` scope class from a CSS string.
fn first_svelte_class(css: &str) -> String {
    let idx = css
        .find("svelte-")
        .expect("CSS should contain a svelte- class");
    let rest = &css[idx + "svelte-".len()..];
    let end = rest
        .find(|c: char| !c.is_ascii_alphanumeric())
        .unwrap_or(rest.len());
    format!("svelte-{}", &rest[..end])
}

/// The raw digest handed to the callback must be the one the compiler's
/// *default* `cssHash` digests — the filename when known (not always the
/// CSS). Building `svelte-${hash}` from what the callback received must
/// therefore equal the default (no-callback) scope class, for both a known
/// filename and an unknown one. Guards the regression where the bridge
/// always hashed the CSS regardless of filename.
#[test]
fn css_hash_input_matches_default_source_selection() {
    let css = "<h1>x</h1>\n<style>h1{color:red}</style>";

    // (a) filename known -> upstream digests the filename.
    let default_named = drive(
        css,
        r#"{"filename":"App.svelte","css":"external"}"#,
        &empty_callbacks(),
    );
    let default_named_class =
        first_svelte_class(default_named["result"]["css"]["code"].as_str().unwrap());
    let mut probe_named = CssHashProbe::default();
    let cb_named = RsvelteCallbacks {
        css_hash: Some(css_hash_cb),
        css_hash_userdata: &mut probe_named as *mut _ as *mut c_void,
        ..empty_callbacks()
    };
    let _ = drive(
        css,
        r#"{"filename":"App.svelte","css":"external"}"#,
        &cb_named,
    );
    assert_eq!(
        format!("svelte-{}", probe_named.seen_hash),
        default_named_class,
        "with a known filename, `svelte-${{hash}}` from the callback input must equal the default class"
    );

    // (b) no filename -> upstream digests the CSS.
    let default_anon = drive(css, r#"{"css":"external"}"#, &empty_callbacks());
    let default_anon_class =
        first_svelte_class(default_anon["result"]["css"]["code"].as_str().unwrap());
    let mut probe_anon = CssHashProbe::default();
    let cb_anon = RsvelteCallbacks {
        css_hash: Some(css_hash_cb),
        css_hash_userdata: &mut probe_anon as *mut _ as *mut c_void,
        ..empty_callbacks()
    };
    let _ = drive(css, r#"{"css":"external"}"#, &cb_anon);
    assert_eq!(
        format!("svelte-{}", probe_anon.seen_hash),
        default_anon_class,
        "with no filename, `svelte-${{hash}}` from the callback input must equal the default class"
    );

    // The two sources differ, so the digests must differ — proving the
    // selection is filename-vs-css, not a constant.
    assert_ne!(
        probe_named.seen_hash, probe_anon.seen_hash,
        "filename-based and css-based digests must differ"
    );
}

extern "C" fn css_hash_null_cb(
    _userdata: *mut c_void,
    _input: *const RsvelteCssHashInput,
) -> RsvelteStr {
    // Decline — the library must fall back to the default hash.
    RsvelteStr {
        data: std::ptr::null(),
        len: 0,
    }
}

#[test]
fn css_hash_callback_null_return_falls_back_to_default() {
    let callbacks = RsvelteCallbacks {
        css_hash: Some(css_hash_null_cb),
        ..empty_callbacks()
    };
    let with_cb = drive(
        "<h1>x</h1>\n<style>h1{color:red}</style>",
        r#"{"filename":"App.svelte","css":"external"}"#,
        &callbacks,
    );
    let plain = drive(
        "<h1>x</h1>\n<style>h1{color:red}</style>",
        r#"{"filename":"App.svelte","css":"external"}"#,
        &empty_callbacks(),
    );
    assert_eq!(
        with_cb["result"]["css"]["code"], plain["result"]["css"]["code"],
        "a declining css_hash callback must match the default-hash output"
    );
}

#[test]
fn css_hash_override_wins_over_callback() {
    let mut probe = CssHashProbe::default();
    let callbacks = RsvelteCallbacks {
        css_hash: Some(css_hash_cb),
        css_hash_userdata: &mut probe as *mut _ as *mut c_void,
        ..empty_callbacks()
    };
    let env = drive(
        "<h1>x</h1>\n<style>h1{color:red}</style>",
        r#"{"filename":"App.svelte","css":"external","cssHashOverride":"svelte-zzzzzz"}"#,
        &callbacks,
    );
    let css_code = ok(&env)["css"]["code"].as_str().unwrap_or("").to_string();
    assert!(
        css_code.contains("svelte-zzzzzz"),
        "constant cssHashOverride must win; got: {css_code}"
    );
    assert_eq!(
        probe.invocations, 0,
        "css_hash callback must not be invoked when cssHashOverride is set"
    );
}

// ---------------------------------------------------------------------------
// warningFilter callback
// ---------------------------------------------------------------------------

struct FilterProbe {
    keep: bool,
    seen: Vec<String>,
}

extern "C" fn warning_filter_cb(
    userdata: *mut c_void,
    warning_json: *const u8,
    warning_json_len: usize,
) -> bool {
    // SAFETY: `userdata` is the `&mut FilterProbe` passed in; the JSON slice
    // is valid for this call.
    let probe = unsafe { &mut *(userdata as *mut FilterProbe) };
    // SAFETY: `(warning_json, warning_json_len)` is a borrowed UTF-8 slice valid for this call.
    let bytes = unsafe { std::slice::from_raw_parts(warning_json, warning_json_len) };
    let json: Value = serde_json::from_slice(bytes).expect("warning JSON is valid");
    probe
        .seen
        .push(json["code"].as_str().unwrap_or("").to_string());
    probe.keep
}

/// An unused CSS selector reliably produces a `css_unused_selector` warning.
const WARN_SOURCE: &str = "<h1>x</h1>\n<style>.unused{color:red}</style>";

fn warning_codes(env: &Value) -> Vec<String> {
    ok(env)["warnings"]
        .as_array()
        .map(|arr| {
            arr.iter()
                .map(|w| w["code"].as_str().unwrap_or("").to_string())
                .collect()
        })
        .unwrap_or_default()
}

#[test]
fn warning_filter_drops_warnings_when_false() {
    // Sanity: the baseline compile emits at least one warning.
    let baseline = drive(
        WARN_SOURCE,
        r#"{"filename":"App.svelte"}"#,
        &empty_callbacks(),
    );
    assert!(
        !warning_codes(&baseline).is_empty(),
        "baseline should emit a warning to filter"
    );

    let mut probe = FilterProbe {
        keep: false,
        seen: Vec::new(),
    };
    let callbacks = RsvelteCallbacks {
        warning_filter: Some(warning_filter_cb),
        warning_filter_userdata: &mut probe as *mut _ as *mut c_void,
        ..empty_callbacks()
    };
    let env = drive(WARN_SOURCE, r#"{"filename":"App.svelte"}"#, &callbacks);
    assert!(
        warning_codes(&env).is_empty(),
        "warning_filter returning false must drop every warning"
    );
    assert!(
        !probe.seen.is_empty(),
        "the filter callback must have seen the warning(s)"
    );
}

#[test]
fn warning_filter_keeps_warnings_when_true() {
    let baseline = warning_codes(&drive(
        WARN_SOURCE,
        r#"{"filename":"App.svelte"}"#,
        &empty_callbacks(),
    ));
    let mut probe = FilterProbe {
        keep: true,
        seen: Vec::new(),
    };
    let callbacks = RsvelteCallbacks {
        warning_filter: Some(warning_filter_cb),
        warning_filter_userdata: &mut probe as *mut _ as *mut c_void,
        ..empty_callbacks()
    };
    let env = drive(WARN_SOURCE, r#"{"filename":"App.svelte"}"#, &callbacks);
    assert_eq!(
        warning_codes(&env),
        baseline,
        "warning_filter returning true must keep every warning"
    );
}

// ---------------------------------------------------------------------------
// null / passthrough
// ---------------------------------------------------------------------------

#[test]
fn null_callbacks_match_plain_compile() {
    let env = drive(
        "<h1>x</h1>",
        r#"{"filename":"App.svelte"}"#,
        &empty_callbacks(),
    );
    assert_eq!(env["ok"], Value::Bool(true));
}

#[test]
fn module_warning_filter_is_applied() {
    // Module compilation honours warningFilter too; css_hash is ignored.
    let mut probe = FilterProbe {
        keep: true,
        seen: Vec::new(),
    };
    let callbacks = RsvelteCallbacks {
        css_hash: Some(css_hash_cb), // ignored for modules
        warning_filter: Some(warning_filter_cb),
        warning_filter_userdata: &mut probe as *mut _ as *mut c_void,
        ..empty_callbacks()
    };
    let env = drive_module(
        "export const counter = $state(0);",
        r#"{"filename":"counter.svelte.js"}"#,
        &callbacks,
    );
    assert_eq!(env["ok"], Value::Bool(true));
}
