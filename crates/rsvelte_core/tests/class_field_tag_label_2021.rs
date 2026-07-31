//! Regression tests for the class-field half of issue #2021 — the dev `$.tag`
//! label of a class state field.
//!
//! The label is `<class>.<name>`, where the name is the one written in the
//! source: the `#` survives for a genuinely private field, but a public field is
//! backed by a generated private key and still labelled with its public name
//! (`ClassBody.js:82-90`). A class with no id falls back to `[class]`.

use rsvelte_core::compiler::ModuleCompileOptions;
use rsvelte_core::{GenerateMode, compile_module};

fn compile_dev(src: &str) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("store.svelte.js".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn private_field_keeps_its_hash() {
    let out =
        compile_dev("export class Foo { #count = $state(0); get c() { return this.#count; } }");
    assert!(
        out.contains("$.tag($.state(0), 'Foo.#count')"),
        "in:\n{out}"
    );
}

#[test]
fn public_field_is_labelled_with_its_public_name() {
    let out = compile_dev("export class Foo { count = $state(0); }");
    assert!(out.contains("$.tag($.state(0), 'Foo.count')"), "in:\n{out}");
    assert!(!out.contains("'Foo.#count'"), "in:\n{out}");
}

#[test]
fn anonymous_class_falls_back_to_the_upstream_placeholder() {
    let out = compile_dev("export default class { count = $state(0); }");
    assert!(
        out.contains("$.tag($.state(0), '[class].count')"),
        "in:\n{out}"
    );
    assert!(!out.contains("Unknown."), "in:\n{out}");
}

#[test]
fn a_named_class_expression_uses_its_own_name() {
    let out = compile_dev("export const K = class Named { x = $state(0); };");
    assert!(out.contains("$.tag($.state(0), 'Named.x')"), "in:\n{out}");
}

#[test]
fn production_emits_no_label() {
    let out = compile_module(
        "export class Foo { count = $state(0); }",
        ModuleCompileOptions {
            filename: Some("store.svelte.js".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    assert!(!out.contains("$.tag("), "in:\n{out}");
}
