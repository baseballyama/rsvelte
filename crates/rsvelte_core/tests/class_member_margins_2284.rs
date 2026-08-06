//! Regression tests for issue #2284 — blank lines between re-printed class members.
//!
//! esrap separates two class members with a blank line whenever either prints
//! across several lines or their node types differ, so the client class
//! re-printer has to reproduce those margins rather than copy the source's.

use rsvelte_core::compiler::ModuleCompileOptions;
use rsvelte_core::{GenerateMode, compile_module};

fn compile_client(src: &str) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("store.svelte.js".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn method_after_constructor_keeps_its_margin() {
    let out = compile_client(
        "export class R {\n\t#x = $state({});\n\n\tconstructor(s) {\n\t\tthis.#x = s;\n\t}\n\n\tm(s) {\n\t\treturn this.#x;\n\t}\n}\n",
    );
    assert!(
        out.contains("\t}\n\n\tm(s) {"),
        "expected a blank line between the constructor and `m`:\n{out}"
    );
}

#[test]
fn adjacent_methods_get_a_margin_even_without_one_in_the_source() {
    let out = compile_client(
        "export class R {\n\ty = $state(0);\n\ta() {\n\t\treturn 1;\n\t}\n\tb() {\n\t\treturn 2;\n\t}\n}\n",
    );
    assert!(
        out.contains("\t}\n\n\tb() {"),
        "expected a blank line between the two multiline methods:\n{out}"
    );
}

#[test]
fn adjacent_single_line_properties_get_no_margin() {
    let out = compile_client("export class R {\n\t#x = $state(1);\n\n\tz = 1;\n\tw = 2;\n}\n");
    assert!(
        out.contains("\tz = 1;\n\tw = 2;"),
        "single-line properties of the same kind must stay adjacent:\n{out}"
    );
}
