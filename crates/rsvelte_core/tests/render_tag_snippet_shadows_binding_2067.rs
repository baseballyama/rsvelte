//! Regression tests for issue #2067 — a `{#snippet}` declared inside a block
//! must shadow a same-named outer binding for the whole fragment.
//!
//! Upstream declares the snippet name as a `normal` binding in the fragment's
//! scope (`scope.js` `SnippetBlock`), and `get_transform` drops every `normal`
//! declaration of a scope from the inherited read-transform map when the client
//! walker enters it. rsvelte kept the outer entry, so `{@render row()}` next to
//! a block-local `{#snippet row()}` emitted the prop read `$$props.row(...)`
//! (client) or the derived read `row()(...)` (server).

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_js(src: &str, generate: GenerateMode) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// The issue's repro.
const EACH_SHADOWS_PROP: &str = r#"<script>
	let { row } = $props();
	let items = [1];
</script>
{#each items as item}{#snippet row()}<b>{item}</b>{/snippet}{@render row()}{/each}"#;

#[test]
fn block_local_snippet_wins_over_a_same_named_prop() {
    let out = compile_js(EACH_SHADOWS_PROP, GenerateMode::Client);
    assert!(
        out.contains("row($$anchor)"),
        "expected the local snippet to be called in:\n{out}"
    );
    assert!(
        !out.contains("$$props.row"),
        "the prop binding still won in:\n{out}"
    );
}

/// Every read of the shadowed name inside the fragment is affected, not just the
/// `{@render}` callee.
#[test]
fn snippet_shadows_the_prop_for_other_expressions_too() {
    let src = r#"<script>
	let { row } = $props();
	let open = $state(true);
</script>
{#if open}{#snippet row()}<b>local</b>{/snippet}<p title={typeof row}>x</p>{/if}"#;
    let out = compile_js(src, GenerateMode::Client);
    assert!(
        !out.contains("$$props.row"),
        "the prop binding still won in:\n{out}"
    );
}

/// The shadowing region is the fragment, so an element's `{#snippet}` child only
/// shadows inside that element.
#[test]
fn snippet_inside_an_element_shadows_within_that_element() {
    let src = r#"<script>
	let { row } = $props();
	let open = $state(true);
</script>
{#if open}<div>{#snippet row()}<b>local</b>{/snippet}{@render row()}</div>{/if}"#;
    let out = compile_js(src, GenerateMode::Client);
    assert!(
        out.contains("row(node_1)") || out.contains("row(node)"),
        "expected the local snippet to be called in:\n{out}"
    );
    assert!(
        !out.contains("$$props.row"),
        "the prop binding still won in:\n{out}"
    );
}

/// Server: the shadowed name must not be read-wrapped as a `$derived` getter.
#[test]
fn server_snippet_shadows_a_same_named_derived() {
    let src = r#"<script>
	let base = $state(1);
	let row = $derived(base + 1);
	let open = $state(true);
</script>
{#if open}{#snippet row()}<b>local</b>{/snippet}{@render row()}{/if}"#;
    let out = compile_js(src, GenerateMode::Server);
    assert!(
        out.contains("row($$renderer)"),
        "expected a direct snippet call in:\n{out}"
    );
    assert!(
        !out.contains("row()($$renderer)"),
        "the derived read-wrap still applied in:\n{out}"
    );
}

/// Server: a component's `{#snippet}` children are lifted into props, so the
/// slot body needs the shadow pushed by the component visitor.
#[test]
fn server_component_child_snippet_shadows_a_same_named_derived() {
    let src = r#"<script>
	import Child from './Child.svelte';
	let base = $state(1);
	let row = $derived(base + 1);
</script>
<Child>{#snippet row()}<b>local</b>{/snippet}{@render row()}</Child>"#;
    let out = compile_js(src, GenerateMode::Server);
    assert!(
        !out.contains("row()($$renderer)"),
        "the derived read-wrap still applied in:\n{out}"
    );
}

/// A prop snippet with no local `{#snippet}` of that name must keep resolving to
/// the prop — the shadow is scoped to fragments that actually declare it.
#[test]
fn a_prop_snippet_without_a_local_declaration_is_untouched() {
    let src = r#"<script>
	let { row } = $props();
	let open = $state(true);
</script>
{#if open}{@render row()}{/if}"#;
    let out = compile_js(src, GenerateMode::Client);
    assert!(
        out.contains("$$props.row"),
        "the prop snippet stopped resolving to the prop in:\n{out}"
    );
}

/// A sibling branch that does not declare the snippet keeps the prop.
#[test]
fn sibling_branch_without_the_snippet_keeps_the_prop() {
    let src = r#"<script>
	let { row } = $props();
	let open = $state(true);
</script>
{#if open}{#snippet row()}<b>local</b>{/snippet}{@render row()}{:else}{@render row()}{/if}"#;
    let out = compile_js(src, GenerateMode::Client);
    assert!(
        out.contains("$$props.row"),
        "the alternate branch lost the prop resolution in:\n{out}"
    );
}
