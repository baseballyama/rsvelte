//! Regression test: server component-call codegen must preserve `{...spread}`
//! when the call also has snippet blocks, named slot children, or bindings
//! with children/snippets (issue #448, H-104..H-106).
//!
//! Bug: `collect_all_props` returns `Vec::new()` for `ComponentPropItem::Spread`,
//! so the snippet / named-slot / bound-with-children emission paths silently
//! dropped the spread (or, for the bound variant, dropped the children/snippets
//! alongside the bindings). The component-spreads cases now route through
//! `$.spread_props([…interleaved spreads/props…, { … }])`, matching upstream.

use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

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
