//! Issue #458 H-131: `{@const}` `=` splitters must use byte indices, not
//! character indices, so a multi-byte character before the `=` doesn't corrupt
//! (or panic on) the pattern/init slice.

use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

fn go(src: &str, mode: GenerateMode) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: mode,
            dev: false,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

// No space around `=` so the multi-byte `é` sits immediately before `=`: a
// character index would land mid-`é` (a non-char-boundary byte) and panic.
const SRC: &str = "{#if true}{@const café='x'}{café}{/if}";

#[test]
fn multibyte_const_lhs_client() {
    let out = go(SRC, GenerateMode::Client);
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("café"),
        "multi-byte const identifier lost: {out}"
    );
}

#[test]
fn multibyte_const_lhs_server() {
    let out = go(SRC, GenerateMode::Server);
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("café='x'"),
        "multi-byte const mis-split: {out}"
    );
}
