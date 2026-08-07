//! A comment between `await` and its argument survives the dev
//! `$.track_reactivity_loss` wrap.
//!
//! Upstream rebuilds the expression as `b.call('$.track_reactivity_loss',
//! argument)` and esrap flushes the comment positionally just before the
//! argument, so it lands inside the call. rsvelte splices the argument's source
//! text, which starts at the argument and therefore left the trivia between the
//! `await` keyword and the argument outside the replaced range — dropping it.
//!
//! Expected strings are the official compiler's output.

use rsvelte_core::compiler::ModuleCompileOptions;
use rsvelte_core::{GenerateMode, compile_module};

fn module(src: &str) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("m.svelte.js".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[track_caller]
fn assert_contains(out: &str, expected: &str) {
    assert!(out.contains(expected), "expected `{expected}`. Got:\n{out}");
}

const WRAPPED: &str = "(await $.track_reactivity_loss(/* hi */ load()))()";

#[test]
fn svelte_js_module_keeps_the_comment() {
    let src = "export async function f() {\n\treturn await /* hi */ load();\n}\n";
    assert_contains(&module(src), WRAPPED);
}

#[test]
fn every_comment_in_the_run_is_kept() {
    let src = "export async function f() {\n\treturn await /* a */ /* b */ load();\n}\n";
    assert_contains(
        &module(src),
        "(await $.track_reactivity_loss(/* a */ /* b */ load()))()",
    );
}

/// The operand's own parens do NOT survive: esrap prints from the AST and
/// recomputes parenthesisation from precedence, so a redundant `(load())`
/// collapses to `load()` — official does the same. What this pins is the
/// surrounding shape, where the source's trailing call and the wrap's own
/// `()` stack into `…()()`; the balance check then catches a splice that
/// reads and writes different ranges.
#[test]
fn a_parenthesized_operand_stays_balanced() {
    let src = "export async function f() {\n\treturn (await (load()))();\n}\n";
    let out = module(src);
    assert_contains(&out, "return (await $.track_reactivity_loss(load()))()();");
    assert_eq!(
        out.matches('(').count(),
        out.matches(')').count(),
        "unbalanced parens:\n{out}"
    );
}

/// Upstream breaks the call across lines for a line comment
/// (`$.track_reactivity_loss(\n\t// hi\n\tload()\n)`); splicing source text
/// keeps it on the opening line. oxfmt collapses the two layouts to the same
/// bytes, so only the comment's survival is pinned here.
#[test]
fn a_line_comment_survives() {
    let src = "export async function f() {\n\treturn await // hi\n\t\tload();\n}\n";
    let out = module(src);
    assert_contains(&out, "$.track_reactivity_loss(");
    assert_contains(&out, "// hi");
}

/// Covers the ignore gate rather than the copy: this `await` returns before
/// reaching the copied range, so the assertion moves when the gate breaks, not
/// when the end bound changes.
#[test]
fn an_ignored_await_is_left_alone() {
    let src = "export async function f() {\n\t// svelte-ignore await_reactivity_loss\n\treturn await /* hi */ load();\n}\n";
    let out = module(src);
    assert!(!out.contains("track_reactivity_loss"), "got:\n{out}");
    assert_contains(&out, "/* hi */");
}
