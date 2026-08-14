//! A `//` comment written above a rune-initialized class field must stay above
//! the field instead of being relocated between the `=` and the initializer.
//!
//! Rune fields are rebuilt around generated backing fields, so the transform
//! explicitly carries their leading comments to the replacement field.

use rsvelte_core::compiler::ModuleCompileOptions;
use rsvelte_core::{GenerateMode, compile_module};

fn compile(source: &str, dev: bool) -> String {
    compile_module(
        source,
        ModuleCompileOptions {
            filename: Some("A.svelte.js".to_string()),
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .expect("compile_module failed")
    .js
    .code
}

/// Compare only the class body, so the generated header/import preamble does not
/// have to be restated in every expectation.
fn assert_body(source: &str, dev: bool, expected: &str) {
    let out = compile(source, dev);
    let start = out.find("export class").unwrap_or_else(|| {
        panic!("no class in output:\n{out}");
    });
    assert_eq!(
        out[start..].trim_end(),
        expected.trim_end(),
        "\nfull output:\n{out}"
    );
}

#[test]
fn private_state_comment_stays_above_the_field() {
    assert_body(
        "export class C {\n\t// c\n\t#n = $state(0);\n}\n",
        false,
        "export class C {\n\t// c\n\t#n = $.state(0);\n}",
    );
}

#[test]
fn private_state_comment_stays_above_the_field_in_dev() {
    assert_body(
        "export class C {\n\t// c\n\t#n = $state(0);\n}\n",
        true,
        "export class C {\n\t// c\n\t#n = $.tag($.state(0), 'C.#n');\n}",
    );
}

#[test]
fn private_derived_comment_stays_above_the_field() {
    assert_body(
        "export class C {\n\t#a = $state(1);\n\t// c\n\t#d = $derived(this.#a * 2);\n}\n",
        false,
        "export class C {\n\t#a = $.state(1);\n\t// c\n\t#d = $.derived(() => $.get(this.#a) * 2);\n}",
    );
}

#[test]
fn private_state_raw_comment_stays_above_the_field() {
    assert_body(
        "export class C {\n\t// c\n\t#n = $state.raw({});\n}\n",
        false,
        "export class C {\n\t// c\n\t#n = $.state({});\n}",
    );
}

#[test]
fn each_commented_field_keeps_its_own_comment() {
    assert_body(
        "export class C {\n\t// one\n\t#a = $state(0);\n\t// two\n\t#b = $state(1);\n}\n",
        false,
        "export class C {\n\t// one\n\t#a = $.state(0);\n\t// two\n\t#b = $.state(1);\n}",
    );
}

/// The shape the generated shape-matrix exercises as
/// `comment-slot/class-private-state__L03__line`: the commented field is also
/// assigned in the constructor.
#[test]
fn constructor_assigned_field_keeps_the_comment_above() {
    let source = "export class Counter {\n\t// c\n\t#n = $state(0);\n\tconstructor() {\n\t\tthis.#n = 1;\n\t}\n\tget n() {\n\t\treturn this.#n;\n\t}\n}\n";
    assert_body(
        source,
        false,
        "export class Counter {\n\t// c\n\t#n = $.state(0);\n\tconstructor() {\n\t\t$.set(this.#n, 1);\n\t}\n\tget n() {\n\t\treturn $.get(this.#n);\n\t}\n}",
    );
    assert_body(
        source,
        true,
        "export class Counter {\n\t// c\n\t#n = $.tag($.state(0), 'Counter.#n');\n\tconstructor() {\n\t\t$.set(this.#n, 1);\n\t}\n\tget n() {\n\t\treturn $.get(this.#n);\n\t}\n}",
    );
}

/// A public field's comment stays with its synthesized backing field.
#[test]
fn public_field_comment_stays_above_the_backing_field() {
    assert_body(
        "export class C {\n\t// c\n\tn = $state(0);\n}\n",
        false,
        "export class C {\n\t// c\n\t#n = $.state(0);\n\tget n() {\n\t\treturn $.get(this.#n);\n\t}\n\tset n(value) {\n\t\t$.set(this.#n, value, true);\n\t}\n}",
    );
}

/// Control: block comments were already placed correctly and must stay put.
#[test]
fn block_comment_above_a_private_field_is_unchanged() {
    assert_body(
        "export class C {\n\t/* c */\n\t#n = $state(0);\n}\n",
        false,
        "export class C {\n\t/* c */\n\t#n = $.state(0);\n}",
    );
}

/// Control: a field with no rune is passed through untouched.
#[test]
fn non_rune_field_comment_is_unchanged() {
    assert_body(
        "export class C {\n\t// c\n\t#n = 0;\n}\n",
        false,
        "export class C {\n\t// c\n\t#n = 0;\n}",
    );
}
