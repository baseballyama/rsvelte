//! Regression test for #3275 — `$$restProps` in a template expression.
//!
//! Upstream declares synthetic `rest_prop` bindings for BOTH `$$props` and
//! `$$restProps` in legacy mode (`2-analyze/index.js`), so a reference to
//! either lands in the expression's `dependencies`. `CallExpression.js` then
//! reads `!is_pure(callee) || dependencies.size > 0` — *after* visiting the
//! arguments — so `JSON.stringify($$restProps)` is `has_call`, which is what
//! makes the memoizer emit `$.template_effect`'s dependency-array form and the
//! each block reactive (`$.each(node, 1, …)`).
//!
//! rsvelte declared `$$props` only, so the call was judged pure with no
//! dependencies: the DOM write ended up inside the tracked closure and the each
//! block was generated non-reactive.
//!
//! Every expectation below is the official compiler's output for the same
//! source (`submodules/svelte`, client target, no dev).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
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
fn rest_props_attribute_uses_the_dependency_array_form() {
    let out = client("<div title={JSON.stringify($$restProps)}></div>");
    assert!(
        out.contains("$.template_effect(($0) => $.set_attribute(div, 'title', $0), ["),
        "the value must be computed in its own tracked closure:\n{out}"
    );
    assert!(
        out.contains("$.deep_read_state($$restProps)")
            && out.contains("$.untrack(() => JSON.stringify($$restProps))"),
        "the wrapper itself is unchanged:\n{out}"
    );
}

#[test]
fn rest_props_each_collection_is_reactive() {
    let out = client("{#each Object.keys($$restProps) as k}{k}{/each}");
    assert!(
        out.contains("$.each(node, 1,"),
        "the block must be generated reactive (EACH_ITEM_REACTIVE):\n{out}"
    );
    assert!(
        out.contains("$.set_text(text, $.get(k))"),
        "a reactive each item is read through `$.get`:\n{out}"
    );
}

#[test]
fn a_literal_each_collection_stays_non_reactive() {
    // The control: nothing else about the each flags moved.
    let out = client("{#each [1, 2] as n}{n}{/each}");
    assert!(
        out.contains("$.each(node, 0,"),
        "a literal collection must stay non-reactive:\n{out}"
    );
}

#[test]
fn a_pure_call_over_slots_gets_no_wrapper() {
    // `$$slots` is NOT a binding, so the call contributes no dependency and
    // stays `has_call: false` — `build_expression` must read that flag rather
    // than the phase-3 walk's "any CallExpression" answer.
    // `export let` forces legacy: without a legacy marker the component is
    // `maybe_runes` and `build_expression` bails before the flag is read.
    let out = client("<script>export let a;</script>\n<div title={String($$slots)}></div>");
    assert!(
        out.contains("$.set_attribute(div, 'title', String($$slots))"),
        "a pure call over a non-binding must be emitted verbatim:\n{out}"
    );
    assert!(
        !out.contains("$.untrack(() => String($$slots))"),
        "and must not be wrapped:\n{out}"
    );
}

#[test]
fn a_member_callee_still_gets_the_wrapper() {
    // The control for the flag above: `has_member_expression` alone still
    // reaches `build_expression`, so `JSON.stringify($$slots)` keeps its
    // untrack while staying unmemoized.
    let out = client("<script>export let a;</script>\n<div title={JSON.stringify($$slots)}></div>");
    assert!(
        out.contains("$.set_attribute(div, 'title', ($.untrack(() => JSON.stringify($$slots))))"),
        "a member callee must keep the untrack wrapper:\n{out}"
    );
}

#[test]
fn a_plain_prop_attribute_is_unaffected() {
    // The control from the issue's table: `$$props` and a plain prop already
    // matched, and must keep matching.
    let out = client("<script>export let a;</script>\n<div title={a}></div>");
    assert!(
        !out.contains("$.deep_read_state"),
        "a plain prop attribute must not gain a wrapper:\n{out}"
    );
}

#[test]
fn a_pure_callee_over_rest_props_is_still_memoized() {
    // `String` is a bare global, so upstream's `is_pure` says the callee is pure:
    // the only thing that can set `has_call` here is `dependencies.size > 0`, and
    // that set is only populated once the ARGUMENTS have been visited. This row
    // is what separates the two orderings — `JSON.stringify` above passes either
    // way because a member callee already fails `!is_pure`.
    let out = client("<div title={String($$restProps)}></div>");
    assert!(
        out.contains("$.template_effect(($0) => $.set_attribute(div, 'title', $0), [")
            && out.contains("$.deep_read_state($$restProps)")
            && out.contains("$.untrack(() => String($$restProps))"),
        "a pure callee over `$$restProps` must still reach the dependency-array form:\n{out}"
    );
}

#[test]
fn a_pure_callee_over_sanitized_props_is_still_memoized() {
    let out = client("<div title={String($$props)}></div>");
    assert!(
        out.contains("$.template_effect(($0) => $.set_attribute(div, 'title', $0), [")
            && out.contains("$.deep_read_state($$sanitized_props)")
            && out.contains("$.untrack(() => String($$sanitized_props))"),
        "the same holds for the `$$props` binding:\n{out}"
    );
}
