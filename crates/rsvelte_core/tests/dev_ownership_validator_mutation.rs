//! Regression test for member-expression mutations of a `$props()` prop.
//!
//! In runes mode the prop read only becomes `listEl()` in the post-loop AST
//! pass, so the `$$ownership_validator.mutation(...)` wrapper has to be applied
//! after it — it used to run inside the per-statement loop, where its matcher
//! could never fire, and every such mutation shipped unvalidated.
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client_dev(src: &str) -> String {
    let result = compile(
        src,
        CompileOptions {
            filename: Some("PropMutation.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile");
    result.js.code
}

#[test]
fn member_assignment_inside_effect_is_ownership_validated() {
    let src = r#"<script>
	let { listEl } = $props();
	$effect(() => {
		listEl.style.overflow = "hidden";
	});
</script>
"#;
    let out = compile_client_dev(src);
    assert!(
        out.contains("$ownership_validator = $.create_ownership_validator($$props)"),
        "expected the ownership validator preamble, got:\n{out}"
    );
    assert!(
        out.contains(
            "$ownership_validator.mutation('listEl', ['listEl', 'style', 'overflow'], listEl().style.overflow = \"hidden\", 4, 2)"
        ),
        "expected the mutation to be wrapped, got:\n{out}"
    );
}

#[test]
fn each_mutation_reports_its_own_source_location() {
    let src = r#"<script>
	let { listEl } = $props();
	function open() {
		listEl.style.overflow = "hidden";
	}
	function close() {
		listEl.style.overflow = "";
	}
</script>
"#;
    let out = compile_client_dev(src);
    assert!(
        out.contains("listEl().style.overflow = \"hidden\", 4, 2)"),
        "expected the first mutation at 4:2, got:\n{out}"
    );
    assert!(
        out.contains("listEl().style.overflow = \"\", 7, 2)"),
        "expected the second mutation at 7:2, got:\n{out}"
    );
}
