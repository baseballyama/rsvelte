//! #4079: a JSDoc cast around a private class-field read.
//!
//! Upstream wraps the field NODE, so a comment leading it is printed inside the
//! generated `$.get(...)`. rsvelte spliced `$.get(` at the field's own offset,
//! which left the comment outside — where esrap's `ReturnStatement` rule then
//! parenthesised the whole statement. acorn elides the source parens while oxc
//! keeps them as a node, so the comment leads the parenthesised GROUP rather
//! than the field and the widening has to start there.
//!
//! Every expectation below is official's own output for the same input, taken
//! from `submodules/svelte/packages/svelte/src/compiler/index.js`.

use rsvelte_core::{GenerateMode, ModuleCompileOptions, compile_module};

fn client(body: &str) -> String {
    compile_module(
        &format!(
            "export class C {{\n\t#raw = $state.raw(null);\n\t#derived = $derived.by(() => 1);\n\n\tm() {{\n\t\t{body}\n\t}}\n}}"
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

/// No parentheses: the comment leads the field itself, so only the leading-run
/// walk decides where the wrap opens.
#[test]
fn a_comment_leading_a_bare_private_read_prints_inside_the_getter() {
    let out = client("return /** @type {string} */ this.#raw;");
    assert!(
        out.contains("return $.get(/** @type {string} */ this.#raw);"),
        "output:\n{out}"
    );
}

/// The cast spelling: the comment leads the parenthesised group, which the
/// leading-run walk alone cannot reach.
#[test]
fn a_comment_leading_a_parenthesised_private_read_prints_inside_the_getter() {
    let out = client("return /** @type {string} */ (this.#raw);");
    assert!(
        out.contains("return $.get(/** @type {string} */ this.#raw);"),
        "output:\n{out}"
    );
}

/// Redundant parens nest, and the printer drops every one of them.
#[test]
fn a_comment_leading_doubly_parenthesised_read_prints_inside_the_getter() {
    let out = client("return /** @type {string} */ ((this.#raw));");
    assert!(
        out.contains("return $.get(/** @type {string} */ this.#raw);"),
        "output:\n{out}"
    );
}

/// An argument position has no `ReturnStatement` rule to add parens, so this
/// row fails on the comment's owner alone.
#[test]
fn a_comment_leading_a_read_in_an_argument_prints_inside_the_getter() {
    let out = client("return String(/** @type {string} */ (this.#raw));");
    assert!(
        out.contains("return String($.get(/** @type {string} */ this.#raw));"),
        "output:\n{out}"
    );
}

/// A `$derived` field reaches the same wrap through a different classification.
#[test]
fn a_comment_leading_a_parenthesised_derived_read_prints_inside_the_getter() {
    let out = client("const v = /** @type {string} */ (this.#derived);\n\t\treturn v;");
    assert!(
        out.contains("const v = $.get(/** @type {string} */ this.#derived);"),
        "output:\n{out}"
    );
}

/// A line comment cannot share the operand's line, so this pins the flush
/// breaking across lines rather than the inline spelling.
#[test]
fn a_line_comment_leading_a_parenthesised_read_prints_inside_the_getter() {
    let out = client("return (\n\t\t\t// why this is a string\n\t\t\tthis.#raw\n\t\t);");
    assert!(
        out.contains("return $.get(\n\t\t\t// why this is a string\n\t\t\tthis.#raw\n\t\t);"),
        "output:\n{out}"
    );
}

/// The group is the OBJECT of a deeper chain, so the comment belongs to that
/// chain and official keeps it outside. Widening over the group here is a
/// regression no other row can observe.
#[test]
fn a_comment_leading_a_read_that_is_a_deeper_chains_object_stays_outside() {
    let out = client("return /** @type {string} */ (this.#derived).toString();");
    assert!(
        out.contains("return (/** @type {string} */ $.get(this.#derived).toString());"),
        "output:\n{out}"
    );
}

/// The comment-free controls: neither the parens nor the wrap moves without
/// one, which is what says the rows above are about the comment.
#[test]
fn an_unannotated_parenthesised_read_is_wrapped_without_parens() {
    let out = client("return (this.#raw);");
    assert!(out.contains("return $.get(this.#raw);"), "output:\n{out}");
}

/// A local is not rewritten at all, so the cast keeps upstream's own shape —
/// the control that separates "the comment moved" from "the printer changed".
#[test]
fn an_annotated_local_read_is_untouched() {
    let out = client("const local = 1;\n\t\treturn /** @type {string} */ (local);");
    assert!(
        out.contains("return (/** @type {string} */ local);"),
        "output:\n{out}"
    );
}
