//! The dev `$.assign` coerced-proxy warning only fires when the assignment's
//! *value* is used (`path.at(-1) !== 'ExpressionStatement'`,
//! `AssignmentExpression.js`). A template expression converted through the JSON
//! path — an `{@attach}` body, for one — had no such check.
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client_dev(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn a_statement_inside_an_attachment_body_is_not_wrapped() {
    let out = compile_client_dev(
        r#"<script>
	let color = $state('red');
</script>

<canvas {@attach (node) => {
	const context = node.getContext('2d');
	context.fillStyle = color;
}}></canvas>
"#,
    );
    assert!(!out.contains("$.assign("), "got:\n{out}");
    assert!(out.contains("context.fillStyle = color;"), "got:\n{out}");
}

#[test]
fn a_concise_attachment_body_still_is() {
    let out = compile_client_dev(
        r#"<div {@attach (node) => node.textContent = node.nodeName}></div>
"#,
    );
    assert!(
        out.contains("$.assign(node, 'textContent', '='"),
        "got:\n{out}"
    );
}
