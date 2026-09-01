//! A private field in the OBJECT position of a member chain, in a class that
//! also holds a standalone read of the same field.
//!
//! The two reads are decided by two different passes and only one of them is
//! reachable from a text scan: `this.#x.foo` is also matched by a
//! `replace("this.#x.", …)`, `this.#x[0]` is not. So a class member whose
//! standalone read is handled by the AST pass — which skips a member-chain
//! object on the premise that the sibling pass took it — silently drops the
//! computed read unless BOTH passes can parse a bare member.
//!
//! Every expectation below is official's own output for the same input, taken
//! from `submodules/svelte/packages/svelte/src/compiler/index.js`.

use rsvelte_core::{GenerateMode, ModuleCompileOptions, compile_module};

/// The standalone read is the arming half: without it the AST pass never fires
/// and the text loop wraps everything.
fn client(read: &str) -> String {
    compile_module(
        &format!(
            "export class C {{\n\t#x = $state([{{ key: 1 }}]);\n\n\tm(k) {{\n\t\tif (!this.#x) return undefined;\n\t\treturn {read};\n\t}}\n}}"
        ),
        ModuleCompileOptions {
            filename: Some("X.svelte.js".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("module should compile")
    .js
    .code
}

fn assert_pair(read: &str, expected: &str) {
    let out = client(read);
    assert!(
        out.contains("if (!$.get(this.#x)) return undefined;"),
        "the standalone read must stay wrapped for {read} to be measuring anything:\n{out}"
    );
    assert!(out.contains(expected), "expected `{expected}` in:\n{out}");
}

#[test]
fn a_numeric_subscript_read_is_wrapped() {
    assert_pair("this.#x[0]", "return $.get(this.#x)[0];");
}

#[test]
fn a_variable_subscript_read_is_wrapped() {
    assert_pair("this.#x[k]", "return $.get(this.#x)[k];");
}

#[test]
fn a_static_member_read_is_wrapped() {
    assert_pair("this.#x.foo", "return $.get(this.#x).foo;");
}

/// The control: this shape is also reachable from the `this.#x.` text replace,
/// so it stayed correct through the regression the others reproduce.
#[test]
fn a_length_read_is_wrapped() {
    assert_pair("this.#x.length", "return $.get(this.#x).length;");
}

#[test]
fn a_subscript_followed_by_a_property_is_wrapped_once_at_the_root() {
    assert_pair("this.#x[0].key", "return $.get(this.#x)[0].key;");
}

#[test]
fn an_optional_member_read_is_wrapped() {
    assert_pair("this.#x?.foo", "return $.get(this.#x)?.foo;");
}

#[test]
fn an_optional_subscript_read_is_wrapped() {
    assert_pair("this.#x?.[0]", "return $.get(this.#x)?.[0];");
}
