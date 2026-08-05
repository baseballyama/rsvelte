//! `$$ownership_validator.mutation(...)` reports the position of the mutation
//! it wraps. The source scan has to read the member chain through TypeScript
//! non-null assertions and optional accesses, and — when two mutations write
//! the same chain — pair them by the value they assign rather than by output
//! order, because a `$:` body is emitted at the end as a `legacy_pre_effect`.
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
fn a_moved_reactive_statement_keeps_its_own_position() {
    let out = compile_client_dev(
        r#"<script>
	export let box;
	export let texture;

	$: if (box) box.envMap = texture || null;

	function attach(camera) {
		box.envMap = camera.renderTarget.texture;
	}
</script>

<button onclick={() => attach(window.camera)}>attach</button>
"#,
    );
    let reactive = out
        .find("|| null")
        .unwrap_or_else(|| panic!("no reactive mutation:\n{out}"));
    let inside_fn = out
        .find("camera.renderTarget.texture")
        .unwrap_or_else(|| panic!("no function mutation:\n{out}"));
    let line_of = |at: usize| {
        let head = &out[..at];
        let start = head
            .rfind("$$ownership_validator.mutation(")
            .expect("no wrapper");
        let tail = &out[start..];
        let end = tail.find(");").unwrap_or(tail.len());
        tail[..end].to_string()
    };
    assert!(line_of(reactive).contains(", 5, "), "got:\n{out}");
    assert!(line_of(inside_fn).contains(", 8, "), "got:\n{out}");
}

#[test]
fn two_mutations_writing_the_same_value_split_by_reactive_statement() {
    let out = compile_client_dev(
        r#"<script>
	export let camera;
	export let id;

	$: if (camera) {
		camera.userData.id = id;
	}

	function change() {
		camera.userData.id = id;
	}
</script>

<button onclick={change}>change</button>
"#,
    );
    let reactive_at = out
        .find("$.legacy_pre_effect")
        .unwrap_or_else(|| panic!("no reactive effect:\n{out}"));
    assert!(out[..reactive_at].contains(", 10, "), "got:\n{out}");
    assert!(out[reactive_at..].contains(", 6, "), "got:\n{out}");
}

#[test]
fn a_non_null_asserted_chain_is_still_a_mutation_site() {
    let out = compile_client_dev(
        r#"<script lang="ts">
	export let selected: { from: number; to: number } | undefined;

	function apply() {
		selected!.from = 1;
		selected!.to = 2;
	}
</script>

<button onclick={apply}>apply</button>
"#,
    );
    assert!(
        out.contains("['selected', 'from']") && out.contains("['selected', 'to']"),
        "got:\n{out}"
    );
    assert!(out.contains(", 5, 2)"), "got:\n{out}");
    assert!(out.contains(", 6, 2)"), "got:\n{out}");
}
