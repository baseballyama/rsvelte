//! `/** @type {T} */ (expr)` keeps its parentheses; the same comment on a
//! binding does not gain any.
//!
//! acorn drops the parentheses that give the comment its cast semantics, so
//! esrap 2.3.x re-adds them from the comment alone (sveltejs/esrap#164) — but
//! only next to an expression, which is why it tracks binding positions in a
//! `WeakSet`. oxc keeps binding positions in `BindingPattern`, so the split is
//! structural here. Every expectation below is the 5.57.1 oracle's bytes.

use rsvelte_core::compiler::ModuleCompileOptions;
use rsvelte_core::{GenerateMode, compile_module};

fn module(src: &str) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("m.svelte.js".to_string()),
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
fn a_cast_next_to_an_expression_is_parenthesized() {
    let out = module(
        "export function f(load, g) {\n\tconst a = /** @type {number} */ (g);\n\tconst c = /** @type {T} */ (load());\n\treturn [a, c];\n}\n",
    );
    assert!(
        out.contains("const a = /** @type {number} */ (g);"),
        "got:\n{out}"
    );
    assert!(
        out.contains("const c = /** @type {T} */ (load());"),
        "got:\n{out}"
    );
}

#[test]
fn a_cast_spanning_lines_closes_after_its_operand() {
    let out =
        module("export function f(r, s) {\n\treturn /** @type {T} */ (\n\t\tr + s\n\t);\n}\n");
    assert!(
        out.contains("return (/** @type {T} */ (\n\tr + s));"),
        "got:\n{out}"
    );
}

#[test]
fn an_annotation_on_a_binding_gains_no_parentheses() {
    let out = module(
        "export function f() {\n\tconst b = (/** @type {any} */ x) => x;\n\t/** @type {number} */\n\tlet d;\n\tfunction h(/** @type {string} */ s) {\n\t\treturn s;\n\t}\n\treturn [b, d, h];\n}\n",
    );
    assert!(
        out.contains("const b = (/** @type {any} */ x) => x;"),
        "got:\n{out}"
    );
    assert!(
        out.contains("/** @type {number} */\n\tlet d;"),
        "got:\n{out}"
    );
    assert!(
        out.contains("function h(/** @type {string} */ s) {"),
        "got:\n{out}"
    );
    assert!(
        !out.contains("*/ ("),
        "a binding gained a cast paren:\n{out}"
    );
}

#[test]
fn a_plain_block_comment_is_not_a_cast() {
    let out = module("export function f(g) {\n\tconst a = /* keep */ g;\n\treturn a;\n}\n");
    assert!(out.contains("const a = /* keep */ g;"), "got:\n{out}");
}
