//! Regression test: a labeled statement in a converted body must keep its label
//! (issue #456, H-111). The converter previously returned only the body, so a
//! surviving `break label;` / `continue label;` referenced a removed label.

use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_js(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            runes: Some(true),
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn label_is_preserved_with_labeled_continue() {
    let src = r#"<script>let y = $state(0);</script>
<button onclick={() => { outer: for (let i = 0; i < 3; i++) { for (let j = 0; j < 3; j++) { if (j === 1) continue outer; y = i; } } }}>b</button>"#;
    let out = compile_js(src);
    assert!(
        out.contains("outer:"),
        "label declaration dropped, got:\n{out}"
    );
    assert!(
        out.contains("continue outer"),
        "labeled continue missing, got:\n{out}"
    );
}
