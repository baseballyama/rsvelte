//! A comment that leads a PARENTHESIZED expression is flushed against the
//! expression inside the parens, not against the `(`.
//!
//! acorn elides parentheses, so esrap's `flush_comments_until` receives the
//! inner expression's `loc.start` as its bound and breaks the line whenever the
//! comment ends on an earlier one. oxc keeps a `ParenthesizedExpression`, whose
//! span opens at the `(` — usually on the comment's own line — so bounding the
//! flush there printed a space where upstream prints a newline. The shape is
//! ordinary JSDoc: `/** @type {T} */ (` opens the cast and its operand sits on
//! the next line.
//!
//! Every expectation below is the official compiler's bytes (svelte 5.56.10).

use rsvelte_core::compiler::ModuleCompileOptions;
use rsvelte_core::{CompileOptions, GenerateMode, compile, compile_module};

fn module(source: &str) -> String {
    compile_module(
        source,
        ModuleCompileOptions {
            filename: Some("m.svelte.js".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn component(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn assert_contains(actual: &str, expected: &str) {
    assert!(
        actual.contains(expected),
        "expected `{expected}`. Got:\n{actual}"
    );
}

#[test]
fn a_cast_comment_before_a_wrapped_arrow_keeps_its_line_break() {
    assert_contains(
        &module(
            "export function pin(then) {\n\treturn /** @type {TThen} */ (\n\t\t(...args) => then(...args)\n\t);\n}\n",
        ),
        "return (/** @type {TThen} */\n\t(...args) => then(...args));",
    );
}

#[test]
fn a_cast_comment_before_a_wrapped_binary_keeps_its_line_break() {
    assert_contains(
        &module("export function f() {\n\treturn /** @type {T} */ (\n\t\t1 + 2\n\t);\n}\n"),
        "return (/** @type {T} */\n\t1 + 2);",
    );
}

/// The parens are gone from the output entirely here, which is what makes the
/// break the only observable: the comment is the reason the operand moves down.
#[test]
fn a_cast_comment_in_an_initializer_keeps_its_line_break() {
    assert_contains(
        &module(
            "export function f(bar) {\n\tconst x = /** @type {T} */ (\n\t\tbar\n\t);\n\treturn x;\n}\n",
        ),
        "const x = /** @type {T} */\n\tbar;",
    );
}

/// CONTROL: with the comment and the operand on one line there is no break to
/// keep, and the pad is a single space on both sides of the fix.
#[test]
fn a_cast_comment_on_the_operands_own_line_still_pads_with_a_space() {
    assert_contains(
        &module("export function f(bar) {\n\tconst x = /** @type {T} */ (bar);\n\treturn x;\n}\n"),
        "const x = /** @type {T} */ bar;",
    );
}

/// CONTROL: an unparenthesized operand already took the bound from the operand
/// itself, so this row must not move — it is what shows the port of
/// `flush_comments_until` was right and only its argument was wrong.
#[test]
fn an_unparenthesized_argument_comment_was_already_broken() {
    assert_contains(
        &module("export function f(bar) {\n\treturn foo(/** @type {T} */\n\tbar);\n}\n"),
        "return foo(\n\t\t/** @type {T} */\n\t\tbar\n\t);",
    );
}

/// The same decision inside a component's instance script, which reaches the
/// printer through a different entry point.
#[test]
fn a_component_instance_script_breaks_the_same_way() {
    assert_contains(
        &component("<script>\n\tlet v = /** @type {T} */ (\n\t\t1 + 2\n\t);\n</script>\n\n{v}\n"),
        "let v = /** @type {T} */\n\t1 + 2;",
    );
}
