//! Shared helpers for FFI integration tests.
//!
//! Each integration test file under `tests/` is its own crate and only uses
//! a subset of these helpers. `dead_code` is allowed at the file level so
//! the test that only drives `compile` doesn't flag `compile_module` (and
//! its `FnVariant::Module` branch) as unused, and vice versa.
#![allow(dead_code)]

use rsvelte_capi::{RsvelteBuf, rsvelte_compile, rsvelte_compile_module, rsvelte_free};
use serde_json::Value;

/// Drive `rsvelte_compile` and decode the envelope.
///
/// The caller passes raw JSON for `options_json` (or empty string for
/// defaults). The returned buffer is freed inside this helper, so the
/// envelope is fully owned by Rust on return.
pub fn compile(source: &str, options_json: &str) -> Value {
    drive(source, options_json, FnVariant::Component)
}

pub fn compile_module(source: &str, options_json: &str) -> Value {
    drive(source, options_json, FnVariant::Module)
}

enum FnVariant {
    Component,
    Module,
}

fn drive(source: &str, options_json: &str, which: FnVariant) -> Value {
    let src = source.as_bytes();
    let opts = options_json.as_bytes();

    // SAFETY: `src`/`opts` are valid byte slices owned by the caller for this call;
    // we pass their pointers (or null when empty) with matching lengths, exactly as
    // the `rsvelte_compile*` FFI contracts require.
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
        match which {
            FnVariant::Component => rsvelte_compile(src_ptr, src.len(), opt_ptr, opts.len()),
            FnVariant::Module => rsvelte_compile_module(src_ptr, src.len(), opt_ptr, opts.len()),
        }
    };

    assert!(!buf.data.is_null(), "FFI returned NULL data");
    assert!(buf.len > 0, "FFI returned zero-length buffer");

    // SAFETY: the FFI call returned a non-null `buf` (asserted above) whose `data`/`len`
    // describe a valid initialized byte buffer; we copy it out before freeing.
    let bytes = unsafe { std::slice::from_raw_parts(buf.data, buf.len) }.to_vec();
    // SAFETY: `buf` was produced by the `rsvelte_compile*` call above and is freed exactly once here.
    unsafe { rsvelte_free(buf) };

    serde_json::from_slice(&bytes).unwrap_or_else(|e| {
        panic!(
            "envelope is not valid JSON: {e}\nbody={:?}",
            String::from_utf8_lossy(&bytes)
        )
    })
}

/// Convenience: assert ok=true and return `result`.
pub fn ok_result(envelope: &Value) -> &Value {
    assert_eq!(
        envelope["ok"],
        Value::Bool(true),
        "expected ok=true envelope, got {envelope}"
    );
    &envelope["result"]
}
