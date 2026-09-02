//! A concise arrow body may not begin with `{`, so upstream's lazy getter for a
//! coercing-in-place operator prints `() => ({})` where the value is an object.
//! esrap decides that on the text it is about to print rather than on the node's
//! kind, which is why `{} && 1` is parenthesised whole while `cond ? {} : []` —
//! the same object literal, not in leading position — is not.
//!
//! rsvelte built the getter as `format!("() => {right}")` over the settled
//! script's own text, so every object-valued `??=` / `||=` / `&&=` came out as
//! `() => {}` — an arrow with an EMPTY BLOCK body, which parses and stores
//! `undefined`. No gate keyed on the number of `$.assign` calls can see it: both
//! sides emit exactly one.
//!
//! Every expectation is the official compiler's own output for the same source.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn assign_line(operator: &str, right: &str) -> String {
    let source = format!(
        "<script>\nexport async function f(o, a, cond, p) {{ return (o.q {operator} {right}); }}\n</script>\n<p>x</p>\n"
    );
    compile(
        &source,
        CompileOptions {
            filename: Some("C.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .unwrap_or_else(|err| panic!("{operator} {right}: {err:?}"))
    .js
    .code
    .lines()
    .find(|line| line.contains("$.assign"))
    .map(|line| line.trim().to_string())
    .unwrap_or_else(|| "(none)".to_string())
}

/// The three cells that separate "the printed body starts with `{`" from "the
/// body node is an object literal": a bare object wraps, a logical expression
/// whose left operand is an object wraps **whole**, and a ternary that merely
/// contains one does not wrap at all. A fix keyed on the node's kind passes the
/// first and fails the second.
#[test]
fn the_getter_parenthesises_a_body_that_begins_with_a_brace() {
    assert_eq!(
        assign_line("??=", "{}"),
        "return $.assign(o, 'q', '??=', () => ({}), 'C.svelte:2:49');"
    );
    assert_eq!(
        assign_line("||=", "{ a: 1 }"),
        "return $.assign(o, 'q', '||=', () => ({ a: 1 }), 'C.svelte:2:49');"
    );
    assert_eq!(
        assign_line("??=", "{} && 1"),
        "return $.assign(o, 'q', '??=', () => ({} && 1), 'C.svelte:2:49');"
    );
    assert_eq!(
        assign_line("??=", "cond ? {} : []"),
        "return $.assign(o, 'q', '??=', () => cond ? {} : [], 'C.svelte:2:49');"
    );
}

/// Bodies that already cannot begin with a brace must be left alone, or the fix
/// is an unconditional wrap that this file would still call green.
#[test]
fn a_body_that_cannot_begin_with_a_brace_is_left_alone() {
    assert_eq!(
        assign_line("??=", "[1]"),
        "return $.assign(o, 'q', '??=', () => [1], 'C.svelte:2:49');"
    );
    assert_eq!(
        assign_line("??=", "({})"),
        "return $.assign(o, 'q', '??=', () => ({}), 'C.svelte:2:49');"
    );
    assert_eq!(
        assign_line("??=", "(a, {})"),
        "return $.assign(o, 'q', '??=', () => (a, {}), 'C.svelte:2:49');"
    );
}

/// `=` is the operator that needs no getter at all, so its object value stays a
/// bare argument — the row that rejects wrapping at the wrong layer.
#[test]
fn a_plain_assignment_has_no_getter_and_no_parentheses() {
    assert_eq!(
        assign_line("=", "{}"),
        "return $.assign(o, 'q', '=', {}, 'C.svelte:2:49');"
    );
}

/// The async getter is built by a second arm of the same `match`, and that arm
/// prints the *hoisted* await argument rather than the right-hand side — so a fix
/// applied only to the synchronous arm leaves this one emitting `() => {}`, and this
/// arm has to be able to fail on its own. `await {}` is what makes it able to:
/// written first as `await p`, this cell passed on the unfixed tree, because the
/// probe was on the half of the shape the defect does not touch. The `await p` row
/// stays as the neighbour that must not move.
#[test]
fn the_async_getter_arm_is_covered_too() {
    assert_eq!(
        assign_line("??=", "await {}"),
        "return (await $.track_reactivity_loss($.assign_async(o, 'q', '??=', () => ({}), 'C.svelte:2:49')))();"
    );
    assert_eq!(
        assign_line("??=", "await p"),
        "return (await $.track_reactivity_loss($.assign_async(o, 'q', '??=', () => p, 'C.svelte:2:49')))();"
    );
}
