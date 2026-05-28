//! Issue #459 H-137: object-rest exclusion keys in `{#each}` context patterns
//! must be JS-escaped — a string-literal key containing a quote would otherwise
//! produce invalid JS in the `$.exclude_from_object(..., [...])` call.

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
fn object_rest_exclusion_key_with_quote_is_escaped() {
    let out = client("{#each items as { \"a'b\": v, ...rest }}{v}{rest}{/each}");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains(r"['a\'b']"),
        "object-rest exclusion key not escaped: {out}"
    );
}
