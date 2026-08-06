//! The `$inspect.trace()` label carries `locate_node(fn)` — the position of the
//! enclosing function, which upstream reads off the AST
//! (`2-analyze/visitors/CallExpression.js`). rsvelte finds it by scanning
//! backwards from the call, so a comment in between used to answer for the
//! function head.
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

#[test]
fn a_comment_before_the_trace_call_does_not_move_the_label() {
    let out = compile(
        r#"<script>
	let count = $state(0);

	$effect(() => {
		// $inspect.trace must be the first statement of a function body
		$inspect.trace();
		count;
	});
</script>
"#,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;

    assert!(
        out.contains("'$effect(...) (Main.svelte:4:9)'"),
        "got:\n{out}"
    );
}
