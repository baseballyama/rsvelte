//! Regression test: a component with two getter/setter `bind:` pairs must
//! declare each helper under the same conflict-resolved name it is called by
//! (issue #468, H-044).
//!
//! Bug: the getter/setter helper declarations hard-coded `bind_get` / `bind_set`
//! while the getter/setter bodies called the unique generated id
//! (`bind_get_1`, …). A second binding therefore called an undeclared
//! `bind_get_1` / `bind_set_1`.

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
fn two_getter_setter_binds_declare_unique_names() {
    let src = r#"<script>let x = $state(0); let y = $state(0);</script>
<C bind:a={() => x, (v) => x = v} bind:b={() => y, (v) => y = v} />"#;
    let out = compile_js(src);

    // The second pair's helpers must be both declared and called under the
    // suffixed name — not declared as `bind_get` while called as `bind_get_1`.
    assert!(
        out.contains("bind_get_1 ="),
        "second getter helper should be declared as bind_get_1, got:\n{out}"
    );
    assert!(
        out.contains("bind_get_1()"),
        "second getter should be called as bind_get_1, got:\n{out}"
    );
    assert!(
        out.contains("bind_set_1("),
        "second setter helper should be declared/called as bind_set_1, got:\n{out}"
    );
}
