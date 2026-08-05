//! A destructuring default is an ordinary expression to upstream, so the dev
//! equality instrumentation (`BinaryExpression.js`) reaches it. rsvelte lifted
//! the pattern's source text verbatim, which skipped every rewrite.
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

#[test]
fn a_derived_destructuring_default_is_instrumented() {
    let out = compile(
        r#"<script>
	const props = $props();
	const { target = typeof window === 'undefined' ? undefined : document.body } = $derived(props);
</script>

{target}
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
        out.contains("$.strict_equals(typeof window, 'undefined')"),
        "got:\n{out}"
    );
}
