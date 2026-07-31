//! Regression tests for the legacy half of issue #2021 — in `dev: true` a legacy
//! state source is labelled with its declaration name.
//!
//! `$: x = …` sources print the same `$.mutable_source()` call but must stay
//! untagged: upstream builds them separately (`transform-client.js:213-219`) and
//! never labels them.

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

const WITH_INIT: &str = "<script>let count = 0; function inc() { count++; }</script><button onclick={inc}>{count}</button>";
const WITHOUT_INIT: &str = "<script>let count; function inc() { count = 1; }</script><button onclick={inc}>{count}</button>";
const REACTIVE: &str =
    "<script>let n = 0; $: doubled = n * 2; function f() { n++; }</script><p>{doubled}</p>";

#[test]
fn initialised_source_is_tagged_in_dev() {
    let out = compile_client(WITH_INIT, true);
    assert!(
        out.contains("$.tag($.mutable_source(0), 'count')"),
        "missing the dev label in:\n{out}"
    );
}

#[test]
fn uninitialised_source_is_tagged_in_dev() {
    let out = compile_client(WITHOUT_INIT, true);
    assert!(
        out.contains("$.tag($.mutable_source(), 'count')"),
        "missing the dev label in:\n{out}"
    );
}

#[test]
fn immutable_keeps_its_second_argument_inside_the_tag() {
    let src = "<script>let count = 0; function inc() { count++; }</script><svelte:options immutable />{count}";
    let out = compile_client(src, true);
    assert!(
        out.contains("$.tag($.mutable_source(0, true), 'count')"),
        "wrong shape in:\n{out}"
    );
}

/// `$: x = …` is a `legacy_reactive` binding, emitted elsewhere and never tagged.
#[test]
fn reactive_declaration_source_stays_untagged() {
    let out = compile_client(REACTIVE, true);
    assert!(
        out.contains("const doubled = $.mutable_source();"),
        "the reactive source was rewritten in:\n{out}"
    );
    assert!(
        !out.contains("'doubled'"),
        "the reactive source picked up a label in:\n{out}"
    );
}

#[test]
fn production_emits_no_label() {
    for src in [WITH_INIT, WITHOUT_INIT, REACTIVE] {
        let out = compile_client(src, false);
        assert!(
            !out.contains("$.tag("),
            "production picked up a dev label in:\n{out}"
        );
    }
}
