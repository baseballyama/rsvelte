//! `CallExpression.js` wraps a `console.*` call only when some argument's
//! `scope.evaluate` can be unknown. Resolution has to follow the scope chain a
//! script reference actually sees: a same-named template binding is not in
//! scope there, and an instance declaration shadows the module one.
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
fn an_instance_local_shadowing_a_module_export_keeps_its_own_value() {
    let out = compile_client_dev(
        "<script module>\n\texport const foo = 42;\n</script>\n\n<script>\n\tlet foo = 100;\n\n\tconsole.log(foo);\n</script>\n",
    );
    assert!(!out.contains("$.log_if_contains_state"), "got:\n{out}");
}

#[test]
fn an_each_item_does_not_shadow_a_script_reference() {
    let out = compile_client_dev(
        r#"<script>
	let method = $state('method');

	function submitPay() {
		console.log(method);
	}

	let methods = [{ method: 1 }];
</script>

{#each methods as { method }}
	<button onclick={submitPay}>{method}</button>
{/each}
"#,
    );
    assert!(!out.contains("$.log_if_contains_state"), "got:\n{out}");
}

#[test]
fn an_unknown_argument_is_still_wrapped() {
    let out = compile_client_dev(
        r#"<script>
	let { value } = $props();

	console.log(value);
</script>
"#,
    );
    assert!(out.contains("$.log_if_contains_state"), "got:\n{out}");
}
