//! Regression test: a `switch` statement in a converted body (event handler /
//! reactive block) must be emitted as a real switch, not flattened into a block
//! (issue #456, H-109).

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
fn switch_in_handler_is_preserved() {
    let src = r#"<script>let x = $state(0), y = $state(0);</script>
<button onclick={() => { switch (x) { case 1: y = 1; break; default: y = 2; } }}>b</button>"#;
    let out = compile_js(src);
    assert!(
        out.contains("switch (x) {"),
        "switch not emitted, got:\n{out}"
    );
    assert!(out.contains("case 1:"), "case label lost, got:\n{out}");
    assert!(out.contains("default:"), "default label lost, got:\n{out}");
    // The reactive assignments inside the cases are still transformed.
    assert!(
        out.contains("$.set(y, 1)") && out.contains("$.set(y, 2)"),
        "got:\n{out}"
    );
    // No blank line inside a case body (between `$.set(y, 1);` and `break;`).
    assert!(
        !out.contains("$.set(y, 1);\n\n"),
        "unexpected blank line inside case body, got:\n{out}"
    );
}
