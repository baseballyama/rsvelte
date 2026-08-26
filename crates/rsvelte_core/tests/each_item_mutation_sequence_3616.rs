//! Regression tests for #3616 — an each-item mutation always goes through the
//! one-element `SequenceExpression` that upstream's EachBlock transform builds.
//!
//! The parentheses are observable raw output even when there is no legacy
//! invalidation expression to append. Comparison-side formatting removes them,
//! so these assertions deliberately inspect the compiler output directly.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("each-item-mutation-sequence.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn runes_each_item_assignments_updates_and_bindings_keep_parentheses() {
    let output = client(
        r#"<script>
	let rows = $state([{ picked: [], name: '', n: 0 }]);
</script>

{#each rows as row, i}
	<button onclick={() => row.picked = 1}>assign</button>
	<button onclick={() => row.n++}>update</button>
	<input bind:value={row.name} />
	<input type="checkbox" value={i} bind:group={row.picked} />
{/each}
"#,
    );

    for expected in [
        "() => ($.get(row).picked = 1)",
        "() => ($.get(row).n++)",
        "($$value) => ($.get(row).name = $$value)",
        "($$value) => ($.get(row).picked = $$value)",
    ] {
        assert!(
            output.contains(expected),
            "missing `{expected}` in raw client output:\n{output}"
        );
    }
}

#[test]
fn keyed_each_item_mutation_keeps_the_bare_item_sequence() {
    let output = client(
        r#"<script>
	let rows = $state([{ id: 1, picked: [] }]);
</script>

{#each rows as row (row)}
	<button onclick={() => row.picked = 1}>x</button>
{/each}
"#,
    );

    assert!(
        output.contains("() => (row.picked = 1)"),
        "the keyed each mutation must remain a one-element sequence:\n{output}"
    );
}

#[test]
fn destructured_each_item_mutation_keeps_the_sequence() {
    let output = client(
        r#"<script>
	let rows = $state([{ nested: { value: 0 } }]);
</script>

{#each rows as { nested }}
	<button onclick={() => nested.value = 1}>x</button>
{/each}
"#,
    );

    assert!(
        output.contains("() => (nested().value = 1)"),
        "the destructured each mutation must remain a one-element sequence:\n{output}"
    );
}

#[test]
fn indexed_collection_access_is_not_mistaken_for_an_each_item_mutation() {
    let output = client(
        r#"<script>
	let rows = $state([{ picked: [] }]);
</script>

{#each rows as row, i}
	<button onclick={() => rows[i].picked = 1}>x</button>
{/each}
"#,
    );

    assert!(
        output.contains("() => rows[i].picked = 1"),
        "the indexed collection negative control changed:\n{output}"
    );
    assert!(!output.contains("() => (rows[i].picked = 1)"));
}
