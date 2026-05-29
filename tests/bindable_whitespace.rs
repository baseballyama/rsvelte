//! Regression test: `$bindable (default)` with whitespace before the `(` must
//! be unwrapped like `$bindable(default)` (issue #477, H-061).
//!
//! Bug: the prop transform required `starts_with("$bindable(")`, so
//! `$bindable (0)` (valid JS) wasn't unwrapped and the rune call leaked into the
//! generated `$.prop(...)` default.

use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_js(src: &str) -> String {
    let result = compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            runes: Some(true),
            ..Default::default()
        },
    )
    .expect("compile");
    result.js.code
}

#[test]
fn bindable_with_space_is_unwrapped() {
    let src = r#"<script>let { v = $bindable (0) } = $props();</script>{v}"#;
    let out = compile_js(src);
    assert!(
        !out.contains("$bindable"),
        "$bindable (x) wrapper should be stripped, got:\n{out}"
    );
    assert!(
        out.contains("$.prop($$props, 'v', 11, 0)"),
        "default value should be unwrapped to 0, got:\n{out}"
    );
}

#[test]
fn bindable_without_space_still_works() {
    let src = r#"<script>let { v = $bindable(0) } = $props();</script>{v}"#;
    let out = compile_js(src);
    assert!(!out.contains("$bindable"), "got:\n{out}");
    assert!(out.contains("$.prop($$props, 'v', 11, 0)"), "got:\n{out}");
}
