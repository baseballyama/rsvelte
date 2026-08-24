//! Issue #3272 — a legacy `$:` statement that shares its physical line.
//!
//! The client instance-script pipeline reads one physical line as one
//! statement, so anything written before or after a `$:` on the same line
//! landed on the wrong side of the reactive boundary: the following statement
//! was spliced *inside* the `$.set(...)` call (output no JS parser accepts),
//! or swallowed into the effect body (reactivity silently added), or the
//! reactive wrapper was dropped and a bare `$:` label reached the output
//! (reactivity silently removed).
//!
//! Every expectation below was measured against the official compiler
//! (`submodules/svelte/.../compiler/index.js`) on the same source. The server
//! target is pure AST and was already byte-identical on all of these, so it is
//! the control.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_to(source: &str, generate: GenerateMode) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate,
            ..Default::default()
        },
    )
    .expect("compile failed")
    .js
    .code
}

/// A statement after a `$: <assignment>` on the same line.
const TRAILING_AFTER_ASSIGNMENT: &str =
    "<script>\n\tlet q;\n\t$: q = 1; void q;\n</script>\n<p>{q}</p>\n";

/// A statement after a `$:` whose body is not an assignment.
const TRAILING_AFTER_CALL: &str =
    "<script>\n\tlet q; function f() {}\n\t$: f(); q = 2;\n</script>\n<p>{q}</p>\n";

/// A statement before the `$:` on the same line.
const LEADING_BEFORE_REACTIVE: &str =
    "<script>\n\tlet q;\n\tlet z = 1; void z; $: q = 1;\n</script>\n<p>{q}</p>\n";

#[test]
fn a_statement_after_a_reactive_assignment_is_not_spliced_into_the_set_call() {
    let out = compile_to(TRAILING_AFTER_ASSIGNMENT, GenerateMode::Client);
    // Official: `void $.get(q);` stands on its own, before the effect.
    assert!(
        out.contains("$.set(q, 1);"),
        "the reactive assignment lost its own boundary:\n{out}"
    );
    assert!(
        out.contains("void $.get(q);"),
        "the trailing statement did not survive as a statement:\n{out}"
    );
    assert!(
        !out.contains("$.set(q, 1; void"),
        "the trailing statement was spliced into the argument list:\n{out}"
    );
}

#[test]
fn a_statement_after_a_reactive_call_is_not_swallowed_by_the_effect() {
    let out = compile_to(TRAILING_AFTER_CALL, GenerateMode::Client);
    let set = out.find("$.set(q, 2)").expect("the assignment is missing");
    let effect = out
        .find("$.legacy_pre_effect(")
        .expect("the reactive effect is missing");
    // Official emits the one-time assignment before the effect; inside it, the
    // assignment would re-run on every dependency change.
    assert!(
        set < effect,
        "the trailing assignment was pulled into the effect body:\n{out}"
    );
}

#[test]
fn a_reactive_statement_after_another_statement_keeps_its_effect() {
    let out = compile_to(LEADING_BEFORE_REACTIVE, GenerateMode::Client);
    assert!(
        out.contains("$.legacy_pre_effect(() => {}, () => {"),
        "the reactive wrapper was dropped:\n{out}"
    );
    assert!(
        !out.contains("$: $.set(q, 1)"),
        "a bare `$:` label reached the output:\n{out}"
    );
}

/// The control: the server target derives its boundaries from the typed AST and
/// matched official on all three shapes before the fix.
#[test]
fn the_server_target_keeps_the_reactive_label() {
    for source in [
        TRAILING_AFTER_ASSIGNMENT,
        TRAILING_AFTER_CALL,
        LEADING_BEFORE_REACTIVE,
    ] {
        let out = compile_to(source, GenerateMode::Server);
        assert!(out.contains("$:"), "the server dropped the label:\n{out}");
    }
}

/// The negative control from the issue: the same layout with a plain assignment
/// in place of the `$:` was byte-identical to official before the fix and must
/// stay that way.
#[test]
fn a_plain_assignment_sharing_its_line_is_unaffected() {
    let out = compile_to(
        "<script>\n\tlet q;\n\tq = 1; void q;\n</script>\n<p>{q}</p>\n",
        GenerateMode::Client,
    );
    assert!(out.contains("$.set(q, 1);"), "{out}");
    assert!(out.contains("void $.get(q);"), "{out}");
}
