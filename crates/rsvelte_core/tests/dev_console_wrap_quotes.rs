//! The console method name reaches `$.log_if_contains_state` as a plain
//! `b.literal` (`CallExpression.js`), which esrap prints single-quoted. The
//! text-based wrap has to spell it the same way, because a script fragment that
//! stays raw never reaches the printer to be renormalized.
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

#[test]
fn the_console_method_name_is_single_quoted() {
    let out = compile(
        r#"<script>
	export let value;
	function go() {
		console.error(`v ${value}`, { value });
	}
</script>
<button on:click={go}>go</button>
"#,
        CompileOptions {
            filename: Some("Log.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;

    assert!(
        out.contains("$.log_if_contains_state('error',"),
        "expected a single-quoted method name, got:\n{out}"
    );
}
