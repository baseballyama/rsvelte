//! Memory hygiene — repeated calls should not leak, and zero-init free
//! must be a no-op.

mod common;

use common::compile;
use rsvelte_capi::{RsvelteBuf, rsvelte_free};

#[test]
fn free_of_zero_initialised_buffer_is_noop() {
    let empty = RsvelteBuf {
        data: std::ptr::null_mut(),
        len: 0,
        cap: 0,
    };
    unsafe { rsvelte_free(empty) };
}

#[test]
fn repeated_compile_does_not_panic() {
    // Smoke-test for double-free / use-after-free safety: 1k iterations
    // exercise the alloc/free cycle hard enough to surface obvious bugs.
    for i in 0..1_000 {
        let env = compile(
            "<h1>Hi {name}!</h1>",
            r#"{"filename":"App.svelte"}"#,
        );
        assert_eq!(env["ok"], serde_json::Value::Bool(true), "iter {i}: {env}");
    }
}
