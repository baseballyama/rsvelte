//! Regression tests for issue #2031 — a `{@render}` of a `{#snippet}` declared
//! in the same block fragment was lowered through the *dynamic* path.
//!
//! The scope builder gives each `{#if}` branch (and each `{#key}` fragment) its
//! own scope, but the analysis visitor never entered it, so the render tag's
//! lexical lookup started above the branch, missed the snippet binding, and
//! `metadata.dynamic` stayed true: the client allocated a comment anchor and
//! `$.snippet(...)` where upstream calls the snippet directly, and the server
//! pushed the matching extra `<!---->`.

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

/// The corpus repro (`pattern/matrix/snippet-hoist/attach-component-scope-in-if`).
const IN_IF: &str = r#"<script>
	let open = $state(false);

	function track() {
		return () => {};
	}
</script>

{#if open}
	{#snippet row()}
		<li {@attach track()}>row</li>
	{/snippet}

	{@render row()}
{/if}"#;

#[test]
fn snippet_declared_in_the_same_if_branch_is_called_directly() {
    let out = compile_js(IN_IF, GenerateMode::Client);
    assert!(
        out.contains("row($$anchor)"),
        "expected a direct snippet call in:\n{out}"
    );
    assert!(
        !out.contains("$.snippet("),
        "render tag still took the dynamic path in:\n{out}"
    );
}

#[test]
fn server_does_not_emit_the_dynamic_anchor_comment() {
    let out = compile_js(IN_IF, GenerateMode::Server);
    assert!(
        out.contains("row($$renderer)"),
        "expected a direct snippet call in:\n{out}"
    );
    // Only the render tag's own anchor matters: the dynamic form pushes a
    // `<!---->` immediately after calling the snippet.
    assert!(
        !out.contains("$$renderer.push(`<!---->`)"),
        "server emitted the dynamic anchor comment in:\n{out}"
    );
}

#[test]
fn snippet_declared_in_an_else_branch_is_called_directly() {
    let src = r#"<script>
	let open = $state(false);
</script>

{#if open}
	<p>open</p>
{:else}
	{#snippet row()}
		<li>row</li>
	{/snippet}

	{@render row()}
{/if}"#;
    let out = compile_js(src, GenerateMode::Client);
    assert!(
        out.contains("row($$anchor)"),
        "expected a direct snippet call in:\n{out}"
    );
    assert!(
        !out.contains("$.snippet("),
        "render tag still took the dynamic path in:\n{out}"
    );
}

#[test]
fn snippet_declared_in_the_same_key_block_is_called_directly() {
    let src = r#"<script>
	let id = $state(0);
</script>

{#key id}
	{#snippet row()}
		<li>row</li>
	{/snippet}

	{@render row()}
{/key}"#;
    let out = compile_js(src, GenerateMode::Client);
    assert!(
        out.contains("row($$anchor)"),
        "expected a direct snippet call in:\n{out}"
    );
    assert!(
        !out.contains("$.snippet("),
        "render tag still took the dynamic path in:\n{out}"
    );
}

/// A binding that is not a block-local snippet must still take the dynamic
/// path — entering the branch scope must not widen resolution.
#[test]
fn prop_snippet_stays_dynamic() {
    let src = r#"<script>
	let open = $state(false);
	let { row } = $props();
</script>

{#if open}
	{@render row()}
{/if}"#;
    let out = compile_js(src, GenerateMode::Client);
    assert!(
        out.contains("$.snippet("),
        "a prop snippet must keep the dynamic lowering in:\n{out}"
    );
}

/// `block.end` is exclusive, so a sibling that follows `{/if}` with no
/// whitespace starts at the same offset as the `{:else}` fragment. Keying the
/// alternate scope by the end made the sibling's own scope win the lookup, and
/// the `{@render}` in the alternate then resolved `row` to the `{#snippet}`
/// declared inside that sibling instead of the prop.
#[test]
fn alternate_scope_survives_a_zero_gap_sibling() {
    let src = "<script>\n\tlet a = $state(false);\n\tlet { row } = $props();\n</script>\n{#if a}<p>A</p>{:else}{@render row()}{/if}<div>{#snippet row()}<b>r</b>{/snippet}</div>";
    let client = compile_js(src, GenerateMode::Client);
    assert!(
        client.contains("$.snippet("),
        "the prop snippet was wrongly resolved statically in:\n{client}"
    );
    assert!(
        !client.contains("$$props.row($$anchor)"),
        "the prop snippet was wrongly called directly in:\n{client}"
    );
    let server = compile_js(src, GenerateMode::Server);
    assert!(
        server.contains("$$renderer.push(`<!---->`)"),
        "server dropped the dynamic anchor comment in:\n{server}"
    );
}

/// Every `{:else if}` in a chain shares one end offset, so the same key
/// collision applied to sibling links of the chain.
#[test]
fn else_if_chain_links_get_distinct_scopes() {
    let src = r#"<script>
	let a = $state(0);
</script>

{#if a === 1}
	{#snippet row()}<b>one</b>{/snippet}
	{@render row()}
{:else if a === 2}
	{#snippet row()}<b>two</b>{/snippet}
	{@render row()}
{:else}
	{#snippet row()}<b>other</b>{/snippet}
	{@render row()}
{/if}"#;
    let out = compile_js(src, GenerateMode::Client);
    assert!(
        !out.contains("$.snippet("),
        "a chain link fell back to the dynamic path in:\n{out}"
    );
}
