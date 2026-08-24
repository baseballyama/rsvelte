//! Regression (#3260): runes mode is entered on a *reference* to
//! `$state` / `$derived` / `$effect`, not on a rune *call*.
//!
//! Upstream `ExportedNames.checkGlobalsForRunes` tests
//! `implicitStoreValues.getGlobals()` — every unshadowed `$`-prefixed
//! identifier reference in the component — for membership of a three-element
//! list. rsvelte's port was structured entirely around `CallExpression`, so
//! `{$state}`, `void $state`, `{#each $derived as …}` and friends left the
//! component typed as a legacy class component.
//!
//! Every expectation below is the byte the pinned official `svelte2tsx`
//! produces for the same source.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn to_tsx(src: &str) -> String {
    let opts = Svelte2TsxOptions {
        filename: "Probe.svelte".to_string(),
        ..Default::default()
    };
    svelte2tsx(src, opts).expect("svelte2tsx").code
}

#[track_caller]
fn assert_runes(src: &str) {
    let out = to_tsx(src);
    assert!(
        out.contains("bindings: __sveltets_$$bindings('')"),
        "expected runes mode for:\n{src}\ngot:\n{out}"
    );
    assert!(
        out.contains("__sveltets_2_fn_component("),
        "expected a function component for:\n{src}\ngot:\n{out}"
    );
}

#[track_caller]
fn assert_legacy(src: &str) {
    let out = to_tsx(src);
    assert!(
        out.contains("bindings: \"\""),
        "expected legacy mode for:\n{src}\ngot:\n{out}"
    );
    assert!(
        out.contains("__sveltets_2_isomorphic_component("),
        "expected a class component for:\n{src}\ngot:\n{out}"
    );
}

#[test]
fn template_reference_enters_runes_mode() {
    // No `<script>` at all — the template alone decides.
    assert_runes("{$state}");
    assert_runes("{$state.x}");
    assert_runes("<div id={$derived}></div>");
    assert_runes("{#each $derived as i}{i}{/each}");
    assert_runes("<div {...$effect}></div>");
    // The one template position that already worked.
    assert_runes("{$state(1)}");
}

#[test]
fn instance_script_reference_enters_runes_mode() {
    assert_runes("<script>void $state;</script>");
    assert_runes("<script>a: $derived;</script>");
    assert_runes("<script>function f() { return $effect; }</script>");
    assert_runes("<script>class C { m() { return $state; } }</script>");
    assert_runes("<script>const a = typeof $derived;</script>");
    assert_runes("<script>const a = $state;</script>");
    assert_runes("<script>let a = $effect;</script>");
    assert_runes("<script>const f = () => $state;</script>");
    assert_runes("<script>const o = { k: $derived };</script>");
    assert_runes("<script>const o = [$effect];</script>");
    assert_runes("<script>let a; a = $state;</script>");
    assert_runes("<script>let a; $: a = $derived;</script>");
    assert_runes("<script>export let p = $effect;</script>");
    assert_runes("<script>const { a } = { a: $state };</script>");
}

#[test]
fn a_shadowed_rune_name_stays_a_store_subscription() {
    // `getGlobals()` deletes the names bound by top-level declarations and
    // imports, so `$state` is a store auto-subscription here.
    assert_legacy("<script>import { state } from './s.js';\nvoid $state;</script><div></div>");
    assert_legacy("<script>let derived = 1;\nvoid $derived;</script><div></div>");
    assert_legacy("<script>let state = 1;</script>{$state}");
    assert_legacy("<script>$: state = 1;\nvoid $state;</script><div></div>");
    assert_legacy(
        "<script>let source = {};\n$: ({ state } = source);\nvoid $state;</script><div></div>",
    );

    let output = to_tsx(
        "<script lang=\"ts\">export let api: number;\nlet source = {};\n$: ({ state } = source);\nvoid $state;</script><div></div>",
    );
    assert!(
        output.contains("props: {api: api}"),
        "a reactive `state` declaration must keep legacy exported props:\n{output}"
    );
    // A parameter that literally spells `$state` shadows it too.
    assert_legacy("<script>function f($state) { return $state; }</script><div></div>");
    assert_legacy("<script>try {} catch ($state) { void $state; }</script><div></div>");
}

#[test]
fn a_property_named_like_a_rune_is_not_a_reference() {
    // Upstream skips a `$`-identifier sitting in the property half of a
    // property access.
    assert_legacy("<script>const o = {};\nvoid o.$state;</script><div></div>");
}

#[test]
fn non_listed_dollar_tokens_do_not_enter_runes_mode() {
    // The negative control from the issue: `$props` and `$bindable` ARE runes,
    // and they still do not flip the mode, because upstream's list holds only
    // `$state` / `$derived` / `$effect`.
    for token in ["$props", "$bindable", "$inspect", "$host", "$foo"] {
        assert_legacy(&format!("<script>void {token};</script><div></div>"));
        assert_legacy(&format!("{{{token}}}"));
    }
}

#[test]
fn a_module_script_reference_does_not_enter_runes_mode() {
    // `<script module>` is processed by `processModuleScriptTag`, which never
    // feeds `implicitStoreValues`.
    assert_legacy("<script module>void $state;</script><div></div>");
}
