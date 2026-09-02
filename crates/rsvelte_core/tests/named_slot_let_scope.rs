//! A component's `let:` variable is out of scope inside that component's NAMED
//! slots.
//!
//! Upstream's `Component` scope visitor gives every `slot=`-carrying child
//! `context.state.scope.child()` — a child of the scope OUTSIDE the component —
//! while the `let:` bindings are declared in `metadata.scopes.default`
//! (`phases/scope.js`). So the name is a global there, `is_pure` reports the
//! expression as non-reactive, and legacy `build_expression` collects no
//! reference for it.
//!
//! rsvelte answered both questions with a name lookup that falls back to
//! "any scope", so the same read came out inside a `$.template_effect` and with
//! a `$.deep_read_state` in front of it.
//!
//! The grid crosses the slot the read sits in with the mode, because the two
//! defects live on different sides of `build_expression`'s
//! `runes || maybe_runes` early return: a component with no `<script>` is
//! `maybe_runes`, and no `$.deep_read_state` can be emitted there at all.
//! Every expectation is the official compiler's own output for the same source.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn code(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("P.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// The lines that carry the read: how the text is written, and whether the
/// write is inside an effect.
fn read_lines(src: &str) -> String {
    let out = code(src);
    let picked: Vec<&str> = out
        .lines()
        .map(str::trim)
        .filter(|l| {
            l.contains("nodeValue")
                || l.contains("textContent")
                || l.contains("set_text")
                || l.contains("deep_read_state")
        })
        .collect();
    if picked.is_empty() {
        panic!("no read line in:\n{out}");
    }
    picked.join(" | ")
}

const LEGACY: &str = "<script>\n  export let controller;\n</script>\n";

fn check(cells: &[(&str, String, &str)]) {
    let mut bad = Vec::new();
    for (name, src, expected) in cells {
        let got = read_lines(src);
        if got != *expected {
            bad.push(format!("{name}\n  expected {expected}\n  got      {got}"));
        }
    }
    assert!(bad.is_empty(), "{}", bad.join("\n"));
}

/// `maybe_runes` (no `<script>`): only the reactivity half is observable.
#[test]
fn a_named_slot_read_is_not_reactive() {
    check(&[
        (
            "named slot, svelte:fragment",
            "<C let:options={a}>\n  <svelte:fragment slot=\"title\">{a.n}</svelte:fragment>\n</C>\n"
                .to_string(),
            "text.nodeValue = a.n;",
        ),
        (
            "named slot, element",
            "<C let:options={a}>\n  <span slot=\"title\">{a.n}</span>\n</C>\n".to_string(),
            "span.textContent = a.n;",
        ),
        (
            "named slot, one component deeper",
            "<C let:options={a}>\n  <span slot=\"title\"><E>{a.n}</E></span>\n</C>\n".to_string(),
            "text.nodeValue = a.n;",
        ),
    ]);
}

/// The controls: a read the `let:` DOES reach must stay reactive, and a name
/// that also has an outer binding resolves to the outer one.
#[test]
fn a_default_slot_read_and_a_shadowed_name_still_are() {
    check(&[
        (
            "default slot",
            "<C let:options={a}>{a.n}</C>\n".to_string(),
            "$.template_effect(() => $.set_text(text, $.get(a).n));",
        ),
        (
            "named slot with its own let:",
            "<C>\n  <svelte:fragment slot=\"title\" let:options={a}>{a.n}</svelte:fragment>\n</C>\n"
                .to_string(),
            "$.template_effect(() => $.set_text(text, $.get(a).n));",
        ),
        (
            "named slot, outer prop of the same name",
            "<script>\n  export let a;\n</script>\n<C let:options={a}>\n  <svelte:fragment slot=\"title\">{a.n}</svelte:fragment>\n</C>\n"
                .to_string(),
            "$.template_effect(() => $.set_text(text, ($.deep_read_state(a()), $.untrack(() => a().n))));",
        ),
    ]);
}

/// Legacy mode (`export let` in the script) is the only side where
/// `build_expression` runs, so the reference half is observable only here.
#[test]
fn a_named_slot_read_collects_no_legacy_reference() {
    check(&[
        (
            "legacy, svelte:fragment",
            format!(
                "{LEGACY}<C {{controller}} let:options={{a}}>\n  <svelte:fragment slot=\"title\">{{a.n}}</svelte:fragment>\n</C>\n"
            ),
            "text.nodeValue = ($.untrack(() => a.n));",
        ),
        (
            "legacy, element",
            format!(
                "{LEGACY}<C {{controller}} let:options={{a}}>\n  <span slot=\"title\">{{a.n}}</span>\n</C>\n"
            ),
            "span.textContent = ($.untrack(() => a.n));",
        ),
        (
            "legacy, one component deeper",
            format!(
                "{LEGACY}<C {{controller}} let:options={{a}}>\n  <span slot=\"title\"><E>{{a.n}}</E></span>\n</C>\n"
            ),
            "text.nodeValue = ($.untrack(() => a.n));",
        ),
        (
            "legacy, default slot — the control that must keep both",
            format!("{LEGACY}<C {{controller}} let:options={{a}}>{{a.n}}</C>\n"),
            "$.template_effect(() => $.set_text(text, ($.deep_read_state($.get(a)), $.untrack(() => $.get(a).n))));",
        ),
        (
            "legacy, the slotted node carries the `let:` itself — upstream declares it in the\n         ENCLOSING scope, so its own attributes still read every dependency",
            "<script>\n  export let cls;\n</script>\n<S>\n  <M slot=\"option\" let:option let:index class={cls(index, option)}>x</M>\n</S>\n"
                .to_string(),
            "$.deep_read_state(cls()), | $.deep_read_state($.get(index)), | $.deep_read_state($.get(option)),",
        ),
        (
            "legacy, a plain identifier is not a member read",
            format!(
                "{LEGACY}<C {{controller}} let:options={{a}}>\n  <svelte:fragment slot=\"title\">{{a}}</svelte:fragment>\n</C>\n"
            ),
            "text.nodeValue = a;",
        ),
    ]);
}

/// The slotted node's OWN `let:` of the SAME NAME is a different binding, and
/// upstream declares it in the ENCLOSING scope — so it IS in scope there while
/// the component's is not. The mask is keyed by name and cannot tell the two
/// apart on its own; each of the three places that register a `let:` has to
/// clear it. The rows are one per place: an element, a `svelte:fragment`, and
/// the destructured spelling.
#[test]
fn a_slotted_nodes_own_let_of_the_same_name_is_in_scope() {
    check(&[
        (
            "same name on the component and on an element slot child",
            format!(
                "{LEGACY}<C {{controller}} let:options={{a}}>\n  <span slot=\"title\" let:options={{a}}>{{a.n}}</span>\n</C>\n"
            ),
            "$.template_effect(() => $.set_text(text, ($.deep_read_state($.get(a)), $.untrack(() => $.get(a).n))));",
        ),
        (
            "same name on the component and on a `svelte:fragment` slot child",
            format!(
                "{LEGACY}<C {{controller}} let:options={{a}}>\n  <svelte:fragment slot=\"title\" let:options={{a}}>{{a.n}}</svelte:fragment>\n</C>\n"
            ),
            "$.template_effect(() => $.set_text(text, ($.deep_read_state($.get(a)), $.untrack(() => $.get(a).n))));",
        ),
        (
            "same name, destructured on both",
            format!(
                "{LEGACY}<C {{controller}} let:options={{{{ n }}}}>\n  <span slot=\"title\" let:options={{{{ n }}}}>{{n}}</span>\n</C>\n"
            ),
            "$.template_effect(() => $.set_text(text, $.get(options_1).n));",
        ),
    ]);
}
