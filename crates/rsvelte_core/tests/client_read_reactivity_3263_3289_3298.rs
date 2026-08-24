//! Regression tests for three client "is this read reactive" divergences
//! (baseballyama/rsvelte#3263, #3289, #3298).
//!
//! Upstream decides a template read's `has_state` from
//! `binding.kind !== 'static' && (… || !binding.is_function()) &&
//! !scope.evaluate(node).is_known` (`2-analyze/visitors/Identifier.js`) — a rule
//! about the SOURCE binding. Three separate approximations of `is_known`
//! disagreed with it:
//!
//! * #3263 — a `{@const c = fn}` was judged known because a function-valued
//!   binding was folded to "known"; upstream evaluates a function to the
//!   `FUNCTION` symbol, and a symbol forces `is_known = false`.
//! * #3289 — a never-written `$state` read followed the LOWERED declaration
//!   form (`accessors`, which `customElement` turns on, keeps `$.state(…)`)
//!   instead of the binding's evaluation.
//! * #3298 — a `{@const}` reading another `{@const}` through a pure global
//!   (`String(w)`) never folded, because the folder's template-expression-only
//!   guards (`has_call`, "has a transform") also applied while recursing into a
//!   binding's initializer.
//!
//! Every expected output below was taken from the official Svelte compiler.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client(src: &str, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// #3263: `{@const c = a}` with `a` a function declaration, read as text inside
/// a block. Official keeps the text placeholder and wraps the read in a
/// `template_effect`; rsvelte collapsed it to a one-shot `textContent`.
#[test]
fn const_tag_bound_to_a_function_stays_reactive() {
    let src = r#"<script>
	function a() { return 1; }
</script>
{#if true}{@const c = a}<i>{c}</i>{/if}"#;

    for dev in [false, true] {
        let out = compile_client(src, dev);
        assert!(
            out.contains("$.template_effect(() => $.set_text(text, $.get(c)))"),
            "dev={dev}: expected a template_effect around the `{{@const}}` read. Got:\n{out}"
        );
        assert!(
            !out.contains("i.textContent = $.get(c)"),
            "dev={dev}: the read must not become a one-shot textContent. Got:\n{out}"
        );
        assert!(
            out.contains("<i> </i>"),
            "dev={dev}: the template needs its text placeholder. Got:\n{out}"
        );
    }
}

/// #3263, control: a direct read of the function binding is NOT reactive
/// (upstream's `!binding.is_function()` term), so it stays a `textContent`.
#[test]
fn a_direct_function_read_is_not_reactive() {
    let out = compile_client(
        r#"<script>
	function a() { return 1; }
</script>
{#if true}<i>{a}</i>{/if}"#,
        false,
    );
    assert!(
        out.contains("i.textContent = a"),
        "expected a one-shot textContent for a direct function read. Got:\n{out}"
    );
}

/// #3289: under `customElement` both compilers keep `$.state(1)`, but only
/// rsvelte made every read of it reactive.
#[test]
fn custom_element_never_written_state_read_is_not_reactive() {
    let src = r#"<svelte:options customElement="my-el" />
<script>
	let n = $state(1);
</script>
<p>{n}</p>"#;

    for dev in [false, true] {
        let out = compile_client(src, dev);
        assert!(
            out.contains("$.state(1)"),
            "dev={dev}: `customElement` must keep the state declaration. Got:\n{out}"
        );
        assert!(
            out.contains("p.textContent = $.get(n)"),
            "dev={dev}: the read is known-constant and must be written once. Got:\n{out}"
        );
        assert!(
            out.contains("<p></p>"),
            "dev={dev}: no text placeholder is needed. Got:\n{out}"
        );
    }
}

/// #3289, control: a written `$state` under `customElement` stays reactive.
#[test]
fn custom_element_written_state_read_stays_reactive() {
    let out = compile_client(
        r#"<svelte:options customElement="my-el" />
<script>
	let n = $state(1);
</script>
<p onclick={() => n++}>{n}</p>"#,
        false,
    );
    assert!(
        out.contains("$.template_effect(() => $.set_text(text, $.get(n)))"),
        "a reassigned state read must stay in a template_effect. Got:\n{out}"
    );
}

/// #3289, same mechanism through a `$derived` — the declaration is kept in both
/// modes, so this reproduces with and without `customElement`.
#[test]
fn derived_of_a_constant_read_is_not_reactive() {
    for options in ["", "<svelte:options customElement=\"my-el\" />\n"] {
        let out = compile_client(
            &format!(
                r#"{options}<script>
	let n = $derived(1);
</script>
<p>{{n}}</p>"#
            ),
            false,
        );
        assert!(
            out.contains("p.textContent = $.get(n)"),
            "options={options:?}: a derived of a constant is known. Got:\n{out}"
        );
    }
}

/// #3298: a `{@const}` whose initializer reads an enclosing `{@const}` through a
/// pure global folds to a known value, so the read is a one-time assignment.
#[test]
fn const_tag_reading_an_enclosing_const_tag_is_not_reactive() {
    let src = r#"{#if true}{@const w = "A"}{#if true}{@const c = String(w)}{c}{/if}{/if}"#;

    for dev in [false, true] {
        let out = compile_client(src, dev);
        assert!(
            out.contains("text.nodeValue = $.get(c)"),
            "dev={dev}: expected a direct nodeValue assignment. Got:\n{out}"
        );
        assert!(
            !out.contains("$.set_text(text, $.get(c))"),
            "dev={dev}: an effect that can never fire must not be emitted. Got:\n{out}"
        );
    }
}

/// #3298, control: once the enclosing declaration is reactive the read must be
/// too — the fold has to follow the value, not the syntax.
#[test]
fn const_tag_reading_reactive_state_stays_reactive() {
    let out = compile_client(
        r#"<script>
	let s = $state("A");
	function go() { s = "B"; }
</script>
<button onclick={go}>b</button>
{#if true}{@const w = s}{#if true}{@const c = String(w)}{c}{/if}{/if}"#,
        false,
    );
    assert!(
        out.contains("$.set_text(text, $.get(c))"),
        "a const chain rooted in reactive state must stay reactive. Got:\n{out}"
    );
}
