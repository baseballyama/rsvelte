//! `validate_mutation()` reports each mutation's own source position
//! (`locator(left.start)`, `shared/utils.js`). rsvelte re-finds those positions
//! by scanning the original source, and a `$:` statement is emitted as a
//! `legacy_pre_effect` at the end of the instance body — so consuming the
//! positions in output order hands them to the wrong mutations.
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client_dev(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Own.svelte".to_string()),
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
fn a_moved_reactive_statement_does_not_take_another_mutations_position() {
    let out = compile_client_dev(
        r#"<script>
	export let light;

	$: if (light) light.matrixAutoUpdate = true;

	function apply() {
		light.intensity = 1;
	}
</script>

<button onclick={apply}>go</button>
"#,
    );
    assert!(
        out.contains("['light', 'intensity'], light(light().intensity = 1, true), 7, 2)"),
        "the function mutation should report its own line 7, got:\n{out}"
    );
    assert!(
        out.contains(
            "['light', 'matrixAutoUpdate'], light(light().matrixAutoUpdate = true, true), 4, 15)"
        ),
        "the reactive mutation should report its own line 4, got:\n{out}"
    );
}

#[test]
fn repeated_mutations_of_one_member_keep_their_source_order() {
    let out = compile_client_dev(
        r#"<script>
	export let light;

	$: if (light) light.name = "a";
	$: if (light) light.name = "b";
</script>
"#,
    );
    let first = out.find("= 'a'").expect("first mutation");
    let second = out.find("= 'b'").expect("second mutation");
    assert!(
        first < second,
        "output order should follow source, got:\n{out}"
    );
    assert!(
        out[first..].starts_with("= 'a', true), 4, 15)"),
        "the first should report line 4, got:\n{out}"
    );
    assert!(
        out[second..].starts_with("= 'b', true), 5, 15)"),
        "the second should report line 5, got:\n{out}"
    );
}
