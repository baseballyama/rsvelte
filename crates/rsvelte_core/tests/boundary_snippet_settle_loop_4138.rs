//! A `{#snippet}` declared inside `<svelte:boundary>` is scoped to its own
//! boundary block, so two sibling boundaries can both declare `failed`
//! (upstream `38ef714`, svelte#18593). That block sits inside `$$render_inner`,
//! which is what separates a boundary snippet from every other one: the two
//! hoisting rows below are the controls that keep an ordinary snippet ahead of
//! the component-bindings settle loop.

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

const SIBLING_BOUNDARIES: &str = r#"<script>
	let label = 'x';
</script>

<svelte:boundary>
	<p>a</p>
	{#snippet failed()}<p>1</p>{/snippet}
</svelte:boundary>
<svelte:boundary>
	<p>b</p>
	{#snippet failed()}<p>2</p>{/snippet}
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
fn a_boundary_failed_snippet_is_scoped_to_its_boundary() {
    let out = server(BOUNDARY);
    let snippet = out
        .find("function failed(")
        .unwrap_or_else(|| panic!("no `failed` declaration:\n{out}"));
    assert!(
        snippet > settled_at(&out),
        "the boundary's `failed` snippet is scoped inside `$$render_inner`:\n{out}"
    );
}

/// The scoping is what lets two sibling boundaries each declare `failed`
/// without redeclaring one name in a single scope.
#[test]
fn sibling_boundaries_each_declare_their_own_failed() {
    let out = server(SIBLING_BOUNDARIES);
    assert_eq!(
        out.matches("function failed(").count(),
        2,
        "each boundary declares its own `failed`:\n{out}"
    );
    assert!(
        !out.contains("let $$settled"),
        "no component binding here, so no settle loop:\n{out}"
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
