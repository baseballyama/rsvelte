//! Regression test: `for (x of …)` / `for (x in …)` with an assignment-target
//! left (not a `let`/`const` declaration) must not be dropped (issue #472, H-127).
//!
//! Bug: the script parser converted a non-`VariableDeclaration` for-of/in left to
//! `JsNode::Null`, and the downstream converter then bailed out (`?` on a missing
//! object), discarding the whole loop from the generated output.

use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_js(src: &str) -> String {
    let result = compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile");
    result.js.code
}

#[test]
fn for_of_with_assignment_target_left_is_preserved() {
    let src = r#"<script>
let x;
let out = [];
for (x of [1, 2, 3]) { out.push(x); }
</script>"#;
    let out = compile_js(src);
    assert!(
        out.contains("for (x of"),
        "for-of with assignment-target left was dropped, got:\n{out}"
    );
}

#[test]
fn for_in_with_assignment_target_left_is_preserved() {
    let src = r#"<script>
let k;
let out = [];
for (k in { a: 1 }) { out.push(k); }
</script>"#;
    let out = compile_js(src);
    assert!(
        out.contains("for (k in"),
        "for-in with assignment-target left was dropped, got:\n{out}"
    );
}
