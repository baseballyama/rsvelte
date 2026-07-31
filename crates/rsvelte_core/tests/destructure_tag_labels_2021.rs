//! Regression tests for the destructuring half of issue #2021.
//!
//! The label differs by position: a leaf carries its own binding name, while an
//! `$$array` temp has no name and carries the *top-level* declarator's pattern
//! kind — so `let { a: [x] } = $derived(o)` says `[$derived object]` even though
//! the temp itself comes from an array pattern.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_client(src: &str, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Comp.svelte".to_string()),
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

#[test]
fn derived_object_leaves_carry_their_own_names() {
    let src =
        "<script>let o = $state({a:1,b:2}); let { a, b } = $derived(o);</script><p>{a}{b}</p>";
    let out = compile_client(src, true);
    assert!(
        out.contains("$.tag($.derived(() => o.a), 'a')"),
        "in:\n{out}"
    );
    assert!(
        out.contains("$.tag($.derived(() => o.b), 'b')"),
        "in:\n{out}"
    );
}

#[test]
fn derived_array_temp_is_labelled_iterable() {
    let src = "<script>let o = $state([1,2]); let [a, b] = $derived(o);</script><p>{a}{b}</p>";
    let out = compile_client(src, true);
    assert!(
        out.contains("$.tag($.derived(() => $.to_array(o, 2)), '[$derived iterable]')"),
        "in:\n{out}"
    );
    assert!(
        out.contains("$.tag($.derived(() => $.get($$array)[0]), 'a')"),
        "in:\n{out}"
    );
}

/// The kind comes from the top-level declarator, not from the nested pattern.
#[test]
fn nested_array_under_an_object_pattern_says_object() {
    let src = "<script>let o = $state({a:[1]}); let { a: [x] } = $derived(o);</script><p>{x}</p>";
    let out = compile_client(src, true);
    assert!(
        out.contains("$.tag($.derived(() => $.to_array(o.a, 1)), '[$derived object]')"),
        "in:\n{out}"
    );
}

#[test]
fn state_array_temp_is_labelled_state_iterable() {
    let src = "<script>let [x, y] = $state([1, 2]);</script><p>{x}{y}</p>";
    let out = compile_client(src, true);
    assert!(
        out.contains("$.tag($.derived(() => $.to_array(tmp, 2)), '[$state iterable]')"),
        "in:\n{out}"
    );
}

/// The `$$d` source temp of a `$derived.by` destructure stays bare upstream.
#[test]
fn derived_by_source_temp_stays_untagged() {
    let src =
        "<script>let n = $state(1); let { a } = $derived.by(() => ({ a: n }));</script><p>{a}</p>";
    let out = compile_client(src, true);
    assert!(out.contains("$$d = $.derived("), "in:\n{out}");
    assert!(
        !out.contains("$$d = $.tag("),
        "the source temp was labelled in:\n{out}"
    );
    assert!(
        out.contains("$.tag($.derived(() => $.get($$d).a), 'a')"),
        "in:\n{out}"
    );
}

#[test]
fn legacy_destructured_state_leaves_are_labelled() {
    let src = "<script>let { p, q } = { p: 1, q: 2 }; function f() { p++; }</script><p>{p}{q}</p>";
    let out = compile_client(src, true);
    assert!(
        out.contains("$.tag($.mutable_source(tmp.p), 'p')"),
        "in:\n{out}"
    );
    // `q` is not a state source, so it stays a plain read.
    assert!(out.contains("q = tmp.q"), "in:\n{out}");
}

#[test]
fn production_emits_no_labels() {
    for src in [
        "<script>let o = $state([1,2]); let [a, b] = $derived(o);</script><p>{a}{b}</p>",
        "<script>let [x, y] = $state([1, 2]);</script><p>{x}{y}</p>",
        "<script>let { p, q } = { p: 1, q: 2 }; function f() { p++; }</script><p>{p}{q}</p>",
    ] {
        let out = compile_client(src, false);
        assert!(!out.contains("$.tag("), "in:\n{out}");
    }
}
