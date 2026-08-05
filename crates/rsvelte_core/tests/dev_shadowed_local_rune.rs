//! A rune declared inside a nested function whose name also exists as a
//! top-level binding is rewritten by scanning the settled script for the
//! declaration text, and in dev the `$.tag(...)` label wrap sits between the
//! `=` and the rune call.
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client(src: &str, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

const WRAPPED_STATE: &str = r#"<script>
	function createArray(initial) {
		let array = $state(initial);
		return {
			get value() {
				return array;
			},
			push(entry) {
				array.push(entry);
				array = array.slice();
			}
		};
	}

	const array = createArray(['x']);
</script>

{#each array.value as entry}
	<p>{entry}</p>
{/each}
"#;

#[test]
fn a_shadowed_state_is_read_and_written_through_its_signal_in_dev() {
    let out = compile_client(WRAPPED_STATE, true);
    assert!(out.contains("return $.get(array);"), "got:\n{out}");
    assert!(out.contains("$.get(array).push(entry);"), "got:\n{out}");
    assert!(
        out.contains("$.set(array, $.get(array).slice(), true);"),
        "got:\n{out}"
    );
}

#[test]
fn dev_and_non_dev_agree_on_the_shadowed_transform() {
    let dev = compile_client(WRAPPED_STATE, true);
    let prod = compile_client(WRAPPED_STATE, false);
    for line in ["return $.get(array);", "$.get(array).push(entry);"] {
        assert_eq!(
            dev.contains(line),
            prod.contains(line),
            "{line}\ndev:\n{dev}\nprod:\n{prod}"
        );
    }
}

#[test]
fn a_shadowed_derived_is_read_through_its_signal_in_dev() {
    let out = compile_client(
        r#"<script>
	let count = $state(0);
	const multiplier = () => {
		let multiplier = $state(2);
		let multiple = $derived(count * multiplier);

		return {
			get count() {
				return multiple;
			},
			inc: () => multiplier++
		};
	};
	const multiplied = multiplier();
</script>

<span>{multiplied.count}</span>
<button onclick={() => count++}>increase</button>
"#,
        true,
    );
    assert!(
        out.contains("$.derived(() => $.get(count) * $.get(multiplier))"),
        "got:\n{out}"
    );
    assert!(out.contains("$.update(multiplier)"), "got:\n{out}");
}
