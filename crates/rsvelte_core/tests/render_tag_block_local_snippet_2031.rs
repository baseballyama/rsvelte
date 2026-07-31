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
        !out.contains("<!---->"),
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

/// A snippet that is genuinely out of the render tag's lexical reach must still
/// take the dynamic path — entering the branch scope must not widen resolution.
#[test]
fn snippet_declared_in_a_sibling_branch_stays_dynamic() {
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
