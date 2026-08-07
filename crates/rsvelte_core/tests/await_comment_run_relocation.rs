//! A comment run in front of an `await` keyword travels *into* the dev-mode
//! `(await $.track_reactivity_loss(X))()` wrap, landing just before the wrapped
//! argument — and the shapes that keep it outside keep it outside.
//!
//! Upstream rebuilds the expression from position-less builder nodes and keeps
//! only the argument's original span, so esrap has nothing located to flush the
//! run against until it reaches the argument. Two of its other flush points win
//! first: an enclosing node that begins on the `await` keyword itself, and the
//! same-line trailing flush after a preceding list element.
//!
//! Every expectation below is the official compiler's bytes.

use rsvelte_core::compiler::ModuleCompileOptions;
use rsvelte_core::{CompileOptions, GenerateMode, compile, compile_module};

fn module(body: &str) -> String {
    compile_module(
        &format!("export async function f() {{\n{body}}}\n"),
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

fn component(body: &str) -> String {
    compile(
        body,
        CompileOptions {
            filename: Some("T.svelte".into()),
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

#[test]
fn a_comment_before_a_parenthesized_await_moves_inside_the_wrap() {
    assert_contains(
        &module("\treturn (/* c */ await load())();\n"),
        "return (await $.track_reactivity_loss(/* c */ load()))()();",
    );
}

/// The adjacent shape — comment *between* `await` and its operand — already
/// landed inside the call, and has to keep doing so.
#[test]
fn a_comment_between_await_and_its_operand_still_lands_inside() {
    assert_contains(
        &module("\treturn await /* c */ load();\n"),
        "return (await $.track_reactivity_loss(/* c */ load()))();",
    );
}

/// A statement that *begins* with the `await` is the shape upstream flushes the
/// run against the statement instead, so the comment stays outside the wrap.
#[test]
fn a_statement_leading_comment_stays_outside_the_wrap() {
    assert_contains(
        &module("\t/* c */ await load();\n"),
        "/* c */ (await $.track_reactivity_loss(load()))();",
    );
}

/// Likewise for any other node that begins on the `await` keyword.
#[test]
fn a_comment_leading_an_enclosing_expression_stays_outside_the_wrap() {
    assert_contains(
        &module("\treturn /* c */ await load() + 1;\n"),
        "return (/* c */ (await $.track_reactivity_loss(load()))() + 1);",
    );
}

/// A run separated from the previous list element by only a comma, on that
/// element's own line, is printed as *its* trailing comment.
#[test]
fn a_comment_trailing_the_previous_list_element_stays_outside_the_wrap() {
    assert_contains(
        &module("\tg(1, /* c */ await load());\n"),
        "g(1, /* c */ (await $.track_reactivity_loss(load()))());",
    );
}

/// The same source shape one line down: no longer trailing, so it moves.
#[test]
fn a_comma_separated_run_on_its_own_line_moves_inside_the_wrap() {
    assert_contains(
        &module("\tg(\n\t\t1,\n\t\t/* c */ await load()\n\t);\n"),
        "g(1, (await $.track_reactivity_loss(/* c */ load()))());",
    );
}

#[test]
fn every_comment_in_the_run_moves_together() {
    assert_contains(
        &module("\treturn (/* a */ /* b */ await load())();\n"),
        "return (await $.track_reactivity_loss(/* a */ /* b */ load()))()();",
    );
}

/// Only the run adjacent to the `await` moves; a comment the `(` separates from
/// it belongs to the enclosing call and stays put.
#[test]
fn a_run_broken_by_a_paren_moves_only_its_adjacent_half() {
    assert_contains(
        &module("\treturn /* a */ (/* b */ await load())();\n"),
        "return (/* a */ (await $.track_reactivity_loss(/* b */ load()))()());",
    );
}

/// A comment that stood on a line of its own keeps that break, which is also
/// what stops a line comment from swallowing the wrapper's own `))()`.
#[test]
fn a_comment_on_its_own_line_keeps_the_break() {
    assert_contains(
        &module("\treturn (\n\t\t/* c */\n\t\tawait load())();\n"),
        "return (await $.track_reactivity_loss(\n\t\t/* c */\n\t\tload()\n\t))()();",
    );
    assert_contains(
        &module("\treturn (\n\t\t// c\n\t\tawait load())();\n"),
        "return (await $.track_reactivity_loss(\n\t\t// c\n\t\tload()\n\t))()();",
    );
}

/// The break is read from the gap up to the `await`, not up to the next comment
/// anywhere in the file: a later comment must not make this run look broken.
#[test]
fn a_later_comment_does_not_break_the_moved_run() {
    assert_contains(
        &module("\treturn (/* c */ await load())();\n\t// tail\n"),
        "return (await $.track_reactivity_loss(/* c */ load()))()();",
    );
}

const RUNES: &str = "<script>\n\tlet x = $state(1);\n\tasync function f() {\n\t\treturn (/* c */ await load())();\n\t}\n</script>\n<p>{x}{f}</p>";

/// A runes instance script reaches a second copy of this rewrite, in
/// `ast_state_transform`, which the module and legacy tails never touch.
#[test]
fn a_runes_instance_script_relocates_the_run_too() {
    assert_contains(
        &component(RUNES),
        "return (await $.track_reactivity_loss(/* c */ load()))()();",
    );
}

#[test]
fn a_runes_instance_script_keeps_a_statement_leading_run_outside() {
    let src = "<script>\n\tlet x = $state(1);\n\tasync function f() {\n\t\t/* c */ await load();\n\t}\n</script>\n<p>{x}{f}</p>";
    assert_contains(
        &component(src),
        "/* c */ (await $.track_reactivity_loss(load()))();",
    );
}

#[test]
fn a_legacy_instance_script_relocates_the_run_too() {
    let src = "<script>\n\texport let x = 1;\n\tasync function f() {\n\t\treturn (/* c */ await load())();\n\t}\n</script>\n<p>{x}{f}</p>";
    assert_contains(
        &component(src),
        "return (await $.track_reactivity_loss(/* c */ load()))()();",
    );
}

/// Covers the ignore gate rather than the move: this `await` never reaches the
/// wrap, so the comment must be left exactly where the source put it.
#[test]
fn an_ignored_await_keeps_its_run_in_place() {
    let out =
        module("\t// svelte-ignore await_reactivity_loss\n\treturn (/* c */ await load())();\n");
    assert!(!out.contains("track_reactivity_loss"), "got:\n{out}");
    assert_contains(&out, "/* c */");
}
