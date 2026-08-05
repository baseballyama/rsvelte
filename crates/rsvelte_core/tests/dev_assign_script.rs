//! `AssignmentExpression.js` wraps a member assignment whose *value* is used in
//! `$.assign(object, 'prop', operator, value, location)` so a proxy the
//! assignment coerces away can still be warned about. The script paths reach
//! those assignments through a text pipeline, not the visitor map.
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client_dev(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("S.svelte".to_string()),
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
fn a_used_member_assignment_in_a_legacy_script_is_wrapped() {
    let out = compile_client_dev(
        r#"<script>
	export let duration = 4000;

	function show(props) {
		const key = { props };
		return new Promise((resolve) => (key.resolveExpiredPromise = resolve));
	}
</script>

<button onclick={() => show({})}>{duration}</button>
"#,
    );
    assert!(
        out.contains("$.assign(key, 'resolveExpiredPromise', '=', resolve, 'S.svelte:6:35')"),
        "got:\n{out}"
    );
}

#[test]
fn a_statement_member_assignment_is_left_alone() {
    let out = compile_client_dev(
        r#"<script>
	export let duration = 4000;

	function show(key) {
		key.done = duration;
	}
</script>

<button onclick={() => show({})}>{duration}</button>
"#,
    );
    assert!(!out.contains("$.assign("), "got:\n{out}");
}
