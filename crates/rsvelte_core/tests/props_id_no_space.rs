//! Regression test: a `$props.id()` declaration with no spaces around `=`
//! (`let id=$props.id()`) must be skipped, not survive alongside the generated
//! `const id = $.props_id()` (issue #477, H-060).

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
fn props_id_without_spaces_is_not_duplicated() {
    let src = r#"<script>let id=$props.id();</script>{id}"#;
    let out = compile_js(src);
    // The raw `$props.id()` declaration must be removed (replaced by the
    // generated `$.props_id()` const) — not left in place.
    assert!(
        !out.contains("$props.id()"),
        "raw $props.id() declaration survived, got:\n{out}"
    );
    assert_eq!(
        out.matches("$.props_id()").count(),
        1,
        "expected exactly one generated props_id declaration, got:\n{out}"
    );
}
