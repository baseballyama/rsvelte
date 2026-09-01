//! A `{#snippet}` declared inside `<svelte:boundary>` must render OUTSIDE the
//! component-bindings settle loop, like every other snippet.
//!
//! Upstream marks each snippet function `___snippet` and
//! `3-transform/server/transform-server.js:180` keeps those declarations ahead of
//! `$$render_inner`. The boundary visitor builds its `failed` declaration itself
//! rather than through the snippet visitor, so it has to record the name the same
//! way — the two hoisting rows below are the controls that a fix must not move.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn server(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate: GenerateMode::Server,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// Byte offset of `$$settled`'s declaration — every snippet must precede it.
fn settled_at(out: &str) -> usize {
    out.find("let $$settled")
        .unwrap_or_else(|| panic!("no settle loop was emitted:\n{out}"))
}

const BOUNDARY: &str = r#"<script>
	let value = $state('');
	let label = 'x';
</script>

<svelte:boundary>
	<Child bind:value />
	{#snippet failed()}
		<p>{label}</p>
	{/snippet}
</svelte:boundary>
"#;

const COMPONENT_LOCAL: &str = r#"<script>
	let value = $state('');
	let label = 'x';
</script>

{#snippet failed()}
	<p>{label}</p>
{/snippet}

<Child bind:value />
{@render failed()}
"#;

const HOISTABLE: &str = r#"<script>
	let value = $state('');
</script>

{#snippet failed()}
	<p>failed</p>
{/snippet}

<Child bind:value />
{@render failed()}
"#;

#[test]
fn a_boundary_failed_snippet_is_declared_before_the_settle_loop() {
    let out = server(BOUNDARY);
    let snippet = out
        .find("function failed(")
        .unwrap_or_else(|| panic!("no `failed` declaration:\n{out}"));
    assert!(
        snippet < settled_at(&out),
        "the boundary's `failed` snippet must precede `$$settled`:\n{out}"
    );
}

#[test]
fn a_component_local_snippet_still_precedes_the_settle_loop() {
    let out = server(COMPONENT_LOCAL);
    let snippet = out
        .find("function failed(")
        .unwrap_or_else(|| panic!("no `failed` declaration:\n{out}"));
    assert!(
        snippet < settled_at(&out),
        "a component-local snippet must precede `$$settled`:\n{out}"
    );
}

#[test]
fn a_hoistable_snippet_stays_at_module_scope() {
    let out = server(HOISTABLE);
    let snippet = out
        .find("function failed(")
        .unwrap_or_else(|| panic!("no `failed` declaration:\n{out}"));
    let component = out
        .find("export default function X(")
        .unwrap_or_else(|| panic!("no component function:\n{out}"));
    assert!(
        snippet < component,
        "a hoistable snippet stays at module scope:\n{out}"
    );
}
