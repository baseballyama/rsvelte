//! Issue #461 M-005: store-subscription detection computed character indices
//! but stored them as byte positions, so a multi-byte character before a
//! `$store` reference shifted the position. Verify a store ref after a
//! multi-byte identifier is still detected and rewritten correctly.

use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

#[test]
fn store_ref_after_multibyte_identifier() {
    let src = "<script>\nimport { writable } from 'svelte/store';\nconst café = 1;\nconst s = writable(0);\n$: total = $s + café;\n</script>\n{total}";
    let out = client(src);
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    // The store read is rewritten through $.store_get and the multi-byte
    // identifier is preserved untouched.
    assert!(
        out.contains("$.store_get(s, '$s'"),
        "store ref not detected: {out}"
    );
    assert!(
        out.contains("café"),
        "multi-byte identifier corrupted: {out}"
    );
}
