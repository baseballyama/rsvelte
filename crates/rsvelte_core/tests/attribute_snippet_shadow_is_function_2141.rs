//! Regression tests for issue #2141 — an attribute expression that reads a
//! block-local `{#snippet}` binding must be wrapped in `$.template_effect`,
//! even when the snippet shadows a same-named outer binding.
//!
//! Upstream's `Binding#is_function()` (`scope.js`) returns `false` for a
//! binding whose `initial` is a `SnippetBlock`, so a snippet read is always
//! treated as having state. rsvelte's `Binding::is_function()` already
//! mirrors that (a `{#snippet}` binding never gets `initial_is_function`
//! set), but `ComponentClientTransformState::get_binding` resolves an
//! identifier through a "root scope" that is deliberately polluted with
//! every scope's declarations for backward compatibility, preferring
//! whichever declaration was merged in first (see its doc comment in
//! `2_analyze/scope.rs`). When a block-local `{#snippet}` shadows a
//! same-named outer binding that isn't a prop/store (a plain script-level
//! `function`, `let`, or `$derived`), that root lookup returns the *outer*
//! binding instead of the snippet, so `is_function()` — and everything
//! downstream that depends on it (the `$.template_effect` wrap, the dev-mode
//! event-handler `$.apply` wrap, `{@const}`/`$derived` compile-time-known
//! folding) — is computed against the wrong binding.
//!
//! `resolve_shadowing_snippet_binding` in `client/visitors/shared/utils.rs`
//! fixes this by re-resolving to the snippet binding whenever the read site
//! is inside a fragment that shadows the name (tracked by
//! `shadowed_prop_names`, populated for every `{#snippet}` a fragment
//! declares — not just prop shadows, despite the name) and the direct
//! `get_binding` result isn't already the snippet.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_js(src: &str, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// Baseline (no shadowing): a plain block-local snippet read in an attribute
/// is already wrapped correctly — this must keep passing.
#[test]
fn unshadowed_snippet_read_is_wrapped() {
    let src = r#"{#if true}
	{#snippet greeting()}<b>hi</b>{/snippet}
	<div data-x={greeting}>x</div>
{/if}"#;
    let out = compile_js(src, false);
    assert!(
        out.contains("$.template_effect(() => $.set_attribute(div, 'data-x', greeting))"),
        "expected a template_effect wrap in:\n{out}"
    );
}

/// The issue's core repro: a block-local `{#snippet}` shadows a same-named
/// outer JS `function` declared in `<script>`. The attribute read must
/// resolve to the (always-reactive) snippet, not the (is_function() == true)
/// outer function, and stay wrapped in `$.template_effect`.
#[test]
fn snippet_shadowing_an_outer_function_is_still_wrapped() {
    let src = r#"<script>
	function greeting() { return 'outer'; }
	let open = $state(true);
</script>
{#if open}
	{#snippet greeting()}<b>hi</b>{/snippet}
	<div data-x={greeting}>x</div>
{/if}"#;
    let out = compile_js(src, false);
    assert!(
        out.contains("$.template_effect(() => $.set_attribute(div, 'data-x', greeting))"),
        "expected a template_effect wrap in:\n{out}"
    );
    assert!(
        !out.contains("$.set_attribute(div, 'data-x', greeting);\n\t\t\t$.append"),
        "the attribute was emitted unwrapped (static) in:\n{out}"
    );
}

/// Same shadowing, but the outer binding is a `let` bound to an arrow
/// function rather than a `function` declaration.
#[test]
fn snippet_shadowing_an_outer_arrow_function_let_is_still_wrapped() {
    let src = r#"<script>
	let greeting = () => 'outer';
	let open = $state(true);
</script>
{#if open}
	{#snippet greeting()}<b>hi</b>{/snippet}
	<div data-x={greeting}>x</div>
{/if}"#;
    let out = compile_js(src, false);
    assert!(
        out.contains("$.template_effect(() => $.set_attribute(div, 'data-x', greeting))"),
        "expected a template_effect wrap in:\n{out}"
    );
}

/// A block-local snippet shadowing an outer `$derived` whose value is
/// compile-time "known" (a literal): the snippet is still always reactive,
/// so the shadowed read must not fold away as static.
#[test]
fn snippet_shadowing_a_known_derived_is_still_wrapped() {
    let src = r#"<script>
	let greeting = $derived('outer');
	let open = $state(true);
</script>
{#if open}
	{#snippet greeting()}<b>hi</b>{/snippet}
	<div data-x={greeting}>x</div>
{/if}"#;
    let out = compile_js(src, false);
    assert!(
        out.contains("$.template_effect(() => $.set_attribute(div, 'data-x', greeting))"),
        "expected a template_effect wrap in:\n{out}"
    );
}

/// Dev-mode event handlers take a different, `is_function()`-gated codegen
/// path (`events.rs::build_event_handler`): a real function binding attaches
/// the handler directly, but a shadowing snippet must still go through the
/// full `$.apply(...)` dev wrap so a throwing handler is reported correctly.
#[test]
fn snippet_shadowing_an_outer_function_still_apply_wraps_the_dev_handler() {
    let src = r#"<script>
	function greeting() { return 'outer'; }
	let open = $state(true);
</script>
{#if open}
	{#snippet greeting()}<b>hi</b>{/snippet}
	<button onclick={greeting}>x</button>
{/if}"#;
    let out = compile_js(src, true);
    assert!(
        out.contains("$.apply(() => greeting, this, $$args, Test,"),
        "expected the dev $.apply wrap in:\n{out}"
    );
}

/// Same dev-mode event-handler check, but through the `on:click` directive
/// path (`on_directive.rs`, which shares `events.rs::build_event_handler`
/// with the `onclick=` attribute path above).
#[test]
fn snippet_shadowing_an_outer_function_still_apply_wraps_the_dev_on_directive() {
    let src = r#"<script>
	function greeting() { return 'outer'; }
	let open = $state(true);
</script>
{#if open}
	{#snippet greeting()}<b>hi</b>{/snippet}
	<button on:click={greeting}>x</button>
{/if}"#;
    let out = compile_js(src, true);
    assert!(
        out.contains("$.apply(() => greeting, this, $$args, Test,"),
        "expected the dev $.apply wrap in:\n{out}"
    );
}

/// A snippet shadowing a prop must keep resolving correctly too (regression
/// guard alongside #2067 / PR #2140, which fixed the analogous `{@render}`
/// callee resolution using a different mechanism, `shadow_snippet_declarations`).
#[test]
fn snippet_shadowing_a_prop_read_in_an_attribute_is_still_wrapped() {
    let src = r#"<script>
	let { row } = $props();
	let open = $state(true);
</script>
{#if open}{#snippet row()}<b>local</b>{/snippet}<p title={typeof row}>x</p>{/if}"#;
    let out = compile_js(src, false);
    assert!(
        out.contains("$.template_effect(() => $.set_attribute(p, 'title', typeof row))"),
        "expected a template_effect wrap in:\n{out}"
    );
    assert!(
        !out.contains("$$props.row"),
        "the prop binding still won in:\n{out}"
    );
}
