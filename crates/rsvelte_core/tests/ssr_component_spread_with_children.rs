//! Regression test: server component-call codegen must preserve `{...spread}`
//! when the call also has snippet blocks, named slot children, or bindings
//! with children/snippets (issue #448, H-104..H-106).
//!
//! Bug: `collect_all_props` returns `Vec::new()` for `ComponentPropItem::Spread`,
//! so the snippet / named-slot / bound-with-children emission paths silently
//! dropped the spread (or, for the bound variant, dropped the children/snippets
//! alongside the bindings). The component-spreads cases now route through
//! `$.spread_props([…interleaved spreads/props…, { … }])`, matching upstream.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn ssr(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            css: CssMode::External,
            runes: Some(true),
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[track_caller]
fn assert_contains(src: &str, needle: &str) {
    let out = ssr(src);
    assert!(
        out.contains(needle),
        "expected SSR output of {src:?} to contain:\n  {needle}\ngot:\n{out}"
    );
}

#[test]
fn h104_spread_with_snippet_preserves_spread() {
    let src = r#"<script>import Child from "./C.svelte"; let rest = $state({});</script><Child {...rest}>{#snippet foo()}body{/snippet}</Child>"#;
    assert_contains(src, "$.spread_props([");
    assert_contains(src, "rest,");
    assert_contains(src, "{ foo, $$slots: { foo: true } }");
}

#[test]
fn h105_spread_with_named_slot_preserves_spread() {
    let src = r#"<script>import Child from "./C.svelte"; let rest = $state({});</script><Child {...rest}><div slot="x">hi</div></Child>"#;
    assert_contains(src, "$.spread_props([");
    assert_contains(src, "rest,");
    assert_contains(src, "x: ($$renderer) =>");
}

#[test]
fn h106_bound_with_spread_and_children_preserves_children() {
    let src = r#"<script>import Child from "./C.svelte"; let v = $state(""); let rest = $state({});</script><Child bind:value={v} {...rest}>kids</Child>"#;
    assert_contains(src, "$.spread_props([");
    assert_contains(src, "rest,");
    assert_contains(src, "get value()");
    assert_contains(src, "children: ($$renderer) =>");
    assert_contains(src, "<!---->kids");
    assert_contains(src, "default: true");
}

#[test]
fn h106_bound_with_spread_and_snippet_preserves_snippet() {
    let src = r#"<script>import Child from "./C.svelte"; let v = $state(""); let rest = $state({});</script><Child bind:value={v} {...rest}>{#snippet foo()}body{/snippet}</Child>"#;
    let out = ssr(src);
    assert!(out.contains("function foo($$renderer)"), "got:\n{out}");
    assert!(out.contains("$.spread_props(["), "got:\n{out}");
    assert!(out.contains("foo,"), "got:\n{out}");
    assert!(out.contains("foo: true"), "got:\n{out}");
}

/// Regression test for source-order preservation of SequenceExpression bindings vs spreads.
///
/// Upstream (component.js): SequenceExpression bindings call `push_prop(…, delay=false)` so they
/// land at their source position in `props_and_spreads`, NOT at the end.
/// Only simple `bind:x={var}` bindings use `delay=true` and are appended after all spreads.
///
/// Before the fix, rsvelte always appended the binding object last, producing the wrong order
/// when `bind:prop={() => get, set}` appeared BEFORE `{...spread}` in source.
#[test]
fn sequence_expr_bind_before_spread_preserves_source_order() {
    // bind:checked (() => getter, setter form) appears BEFORE {...rest} in source →
    // binding object must come FIRST in the $.spread_props([...]) array.
    let src = r#"<script>
import Child from "./C.svelte";
let checked = $state(false);
let onCheckedChange = (v) => (checked = v);
let rest = $state({});
</script><Child bind:checked={() => checked, onCheckedChange} {...rest} />"#;
    let out = ssr(src);
    assert!(
        out.contains("$.spread_props(["),
        "expected spread_props, got:\n{out}"
    );
    // The binding object (get/set checked) must appear BEFORE rest in the array.
    let bind_pos = out.find("get checked()").expect("get checked() not found");
    let rest_pos = out.find("rest,").expect("rest, not found");
    assert!(
        bind_pos < rest_pos,
        "binding object must precede rest in spread_props array (bind at {bind_pos}, rest at {rest_pos}):\n{out}"
    );
}

/// Regression test: simple `bind:x={var}` (non-SequenceExpression) continues to appear
/// AFTER spreads (upstream `delay=true` path), even when the bind appears before spread in source.
#[test]
fn simple_bind_before_spread_still_deferred_to_end() {
    // bind:value={v} (simple binding, delay=true) before {...rest} →
    // binding object must appear AFTER rest in the $.spread_props([...]) array.
    let src = r#"<script>
import Child from "./C.svelte";
let v = $state("");
let rest = $state({});
</script><Child bind:value={v} {...rest} />"#;
    let out = ssr(src);
    assert!(
        out.contains("$.spread_props(["),
        "expected spread_props, got:\n{out}"
    );
    // simple binding must be AFTER rest (deferred to avoid spread clobbering it)
    let bind_pos = out.find("get value()").expect("get value() not found");
    let rest_pos = out.find("rest,").expect("rest, not found");
    assert!(
        rest_pos < bind_pos,
        "rest must precede simple binding in spread_props array (rest at {rest_pos}, bind at {bind_pos}):\n{out}"
    );
}

#[test]
fn unchanged_no_spread_paths_still_work() {
    // Non-spread cases must keep their existing single-object form.
    assert_contains(
        r#"<script>import Child from "./C.svelte";</script><Child a={1}>{#snippet foo()}body{/snippet}</Child>"#,
        "Child($$renderer, { a: 1, foo, $$slots: { foo: true } });",
    );
    assert_contains(
        r#"<script>import Child from "./C.svelte"; let v = $state("");</script><Child bind:value={v}>kids</Child>"#,
        "<!---->kids",
    );
}
