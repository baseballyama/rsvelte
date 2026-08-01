//! Regression tests for issue #2087 — class members that share a physical
//! source line.
//!
//! Class-field lowering scans the class body line by line, so a member written
//! after another one on the same line used to be discarded entirely: neither the
//! private backing field nor its accessors reached the output, and reading the
//! field at runtime returned `undefined`.

use rsvelte_core::compiler::ModuleCompileOptions;
use rsvelte_core::{GenerateMode, compile_module};

fn compile(src: &str, generate: GenerateMode) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("store.svelte.js".to_string()),
            generate,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn derived_after_state_on_one_line_is_lowered_for_the_client() {
    let out = compile(
        "export class Foo { n = $state(1); d = $derived(this.n * 2); }",
        GenerateMode::Client,
    );
    for expected in [
        "#n = $.state(1)",
        "get n()",
        "set n(value)",
        "#d = $.derived(",
        "get d()",
        "set d(value)",
    ] {
        assert!(out.contains(expected), "missing {expected} in:\n{out}");
    }
}

#[test]
fn derived_after_state_on_one_line_is_lowered_for_the_server() {
    let out = compile(
        "export class Foo { n = $state(1); d = $derived(this.n * 2); }",
        GenerateMode::Server,
    );
    assert!(out.contains("#d = $.derived("), "missing #d in:\n{out}");
    assert!(out.contains("get d()"), "missing getter in:\n{out}");
}

#[test]
fn several_runes_on_one_line_all_survive() {
    let out = compile(
        "export class Foo { a = $state(1); r = $state.raw([]); b = $derived.by(() => this.a); c = $derived(this.a + 1); }",
        GenerateMode::Client,
    );
    for expected in [
        "#a = $.state(",
        "#r = $.state(",
        "#b = $.derived(",
        "#c = $.derived(",
    ] {
        assert!(out.contains(expected), "missing {expected} in:\n{out}");
    }
}

#[test]
fn a_method_between_two_fields_on_one_line_keeps_all_three() {
    let out = compile(
        "export class Foo { n = $state(1); get twice() { return this.n * 2 } d = $derived(this.n + 1); }",
        GenerateMode::Client,
    );
    assert!(out.contains("#n = $.state(1)"), "missing #n in:\n{out}");
    assert!(out.contains("get twice()"), "method dropped in:\n{out}");
    assert!(out.contains("#d = $.derived("), "missing #d in:\n{out}");
}

#[test]
fn a_one_line_nested_class_expression_keeps_its_own_fields() {
    let out = compile(
        "export class Outer { a = $state(1); inner = class Inner { c = $state(2); e = $derived(this.c * 3); }; }",
        GenerateMode::Client,
    );
    assert!(out.contains("#a = $.state(1)"), "missing #a in:\n{out}");
    assert!(
        !out.contains("#inner = $.state("),
        "the outer field took the inner field's value in:\n{out}"
    );
    assert!(out.contains("#c = $.state(2)"), "missing #c in:\n{out}");
    assert!(out.contains("#e = $.derived("), "missing #e in:\n{out}");
}

#[test]
fn constructor_declarations_on_one_line_all_survive() {
    let out = compile(
        "export class Foo { constructor() { this.n = $state(1); this.d = $derived(this.n * 2); } }",
        GenerateMode::Client,
    );
    assert!(
        out.contains("this.#n = $.state(1)"),
        "missing #n in:\n{out}"
    );
    assert!(
        out.contains("this.#d = $.derived("),
        "missing #d in:\n{out}"
    );
    assert!(out.contains("get d()"), "missing accessor in:\n{out}");
}

#[test]
fn a_semicolon_inside_a_literal_is_not_a_member_boundary() {
    let out = compile(
        "export class Foo { s = $state('a; b'); t = $state(`c;${1};d`); r = $state(/[};]+/g); }",
        GenerateMode::Client,
    );
    assert!(out.contains("$.state('a; b')"), "string split in:\n{out}");
    assert!(
        out.contains("$.state(`c;${1};d`)"),
        "template split in:\n{out}"
    );
    assert!(out.contains("$.state(/[};]+/g)"), "regex split in:\n{out}");
}
