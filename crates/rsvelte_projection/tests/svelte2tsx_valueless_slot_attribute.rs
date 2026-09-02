//! A `<slot>` attribute with no value at all contributes nothing to the
//! component's `slots: { … }` type. `handleSlot` (`nodes/slot.ts`) opens its loop
//! with `if (!attr.value?.length) continue;` and a valueless attribute's `value`
//! is `true`, so `<slot a />` declares no `a`; rsvelte declared `a:a`.
//!
//! The axis is the attribute's VALUE FORM, not the one prop the ratchet entry
//! named: the rows below carry every shape a `<slot>` attribute can take, and the
//! valueless ones are the only shape that moves. Position and host are crossed in
//! because the divergence is an extra entry in a list — first, last and between
//! two kept entries are three different ways for a list to be wrong — and because
//! an `{#each}` and a component slot resolve their entries through a different
//! scope.
//!
//! Each expectation is the `slots: { … }` clause of the pinned
//! `submodules/language-tools` svelte2tsx's own output. That clause is the whole
//! subject: `<slot data-x />` also diverges in the `__sveltets_createSlot` call
//! and is left to the grid that covers it.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn slots_clause(src: &str) -> String {
    let code = svelte2tsx(
        src,
        Svelte2TsxOptions {
            filename: "T.svelte".to_string(),
            is_ts_file: true,
            ..Default::default()
        },
    )
    .expect("svelte2tsx")
    .code;
    let start = code.find("slots: {").expect("slots clause");
    let end = code[start..].find("}}").expect("slots clause end") + start + 2;
    code[start..end].to_string()
}

#[test]
fn a_valueless_slot_attribute_declares_no_slot_prop() {
    let mut failures = Vec::new();
    for (label, src, expected) in [
        (
            "valueless alone",
            "<script lang=\"ts\">import C from './C.svelte'; export let a: any; export let b: any; const o = {a:1};</script>\n<slot a />",
            "slots: {'default': {}}",
        ),
        (
            "valueless first",
            "<script lang=\"ts\">import C from './C.svelte'; export let a: any; export let b: any; const o = {a:1};</script>\n<slot a b={b} />",
            "slots: {'default': {b:b}}",
        ),
        (
            "valueless last",
            "<script lang=\"ts\">import C from './C.svelte'; export let a: any; export let b: any; const o = {a:1};</script>\n<slot b={b} a />",
            "slots: {'default': {b:b}}",
        ),
        (
            "valueless between",
            "<script lang=\"ts\">import C from './C.svelte'; export let a: any; export let b: any; const o = {a:1};</script>\n<slot b={b} a c=\"x\" />",
            "slots: {'default': {b:b, c:\"x\"}}",
        ),
        (
            "two valueless",
            "<script lang=\"ts\">import C from './C.svelte'; export let a: any; export let b: any; const o = {a:1};</script>\n<slot a b />",
            "slots: {'default': {}}",
        ),
        (
            "valueless with spread",
            "<script lang=\"ts\">import C from './C.svelte'; export let a: any; export let b: any; const o = {a:1};</script>\n<slot {...o} a />",
            "slots: {'default': {...o}}",
        ),
        (
            "valueless on a named slot",
            "<script lang=\"ts\">import C from './C.svelte'; export let a: any; export let b: any; const o = {a:1};</script>\n<slot name=\"s\" a />",
            "slots: {'s': {}}",
        ),
        (
            "valueless, uppercase name",
            "<script lang=\"ts\">import C from './C.svelte'; export let a: any; export let b: any; const o = {a:1};</script>\n<slot A />",
            "slots: {'default': {}}",
        ),
        (
            "valueless inside an each",
            "<script lang=\"ts\">import C from './C.svelte'; export let a: any; export let b: any; const o = {a:1};</script>\n{#each [1] as it}<slot a x={it} />{/each}",
            "slots: {'default': {x:__sveltets_2_unwrapArr([1])}}",
        ),
        (
            "valueless inside a component slot",
            "<script lang=\"ts\">import C from './C.svelte'; export let a: any; export let b: any; const o = {a:1};</script>\n<C><svelte:fragment slot=\"s\"><slot a /></svelte:fragment></C>",
            "slots: {'default': {}}",
        ),
        (
            "shorthand",
            "<script lang=\"ts\">import C from './C.svelte'; export let a: any; export let b: any; const o = {a:1};</script>\n<slot {a} />",
            "slots: {'default': {a:a}}",
        ),
        (
            "empty string",
            "<script lang=\"ts\">import C from './C.svelte'; export let a: any; export let b: any; const o = {a:1};</script>\n<slot a=\"\" />",
            "slots: {'default': {a:\"\"}}",
        ),
        (
            "text literal",
            "<script lang=\"ts\">import C from './C.svelte'; export let a: any; export let b: any; const o = {a:1};</script>\n<slot a=\"x\" />",
            "slots: {'default': {a:\"x\"}}",
        ),
        (
            "expression",
            "<script lang=\"ts\">import C from './C.svelte'; export let a: any; export let b: any; const o = {a:1};</script>\n<slot a={b} />",
            "slots: {'default': {a:b}}",
        ),
        (
            "quoted expression",
            "<script lang=\"ts\">import C from './C.svelte'; export let a: any; export let b: any; const o = {a:1};</script>\n<slot a=\"{b}\" />",
            "slots: {'default': {a:b}}",
        ),
        (
            "text plus expression",
            "<script lang=\"ts\">import C from './C.svelte'; export let a: any; export let b: any; const o = {a:1};</script>\n<slot a=\"x{b}\" />",
            "slots: {'default': {a:\"__svelte_ts_string\"}}",
        ),
        (
            "spread alone",
            "<script lang=\"ts\">import C from './C.svelte'; export let a: any; export let b: any; const o = {a:1};</script>\n<slot {...o} />",
            "slots: {'default': {...o}}",
        ),
        (
            "let: directive",
            "<script lang=\"ts\">import C from './C.svelte'; export let a: any; export let b: any; const o = {a:1};</script>\n<slot let:a />",
            "slots: {'default': {}}",
        ),
        (
            "no attributes",
            "<script lang=\"ts\">import C from './C.svelte'; export let a: any; export let b: any; const o = {a:1};</script>\n<slot />",
            "slots: {'default': {}}",
        ),
    ] {
        let actual = slots_clause(src);
        if actual != expected {
            failures.push(format!(
                "{label}\n  expected {expected:?}\n  actual   {actual:?}"
            ));
        }
    }
    assert!(
        failures.is_empty(),
        "{} of 19 cells diverge from official:\n{}",
        failures.len(),
        failures.join("\n")
    );
}
