//! The client instance-script pipeline splits statements with a scanner, and
//! the scanner's list of "operators a statement cannot end on" is a list, so a
//! line ending in an operator missing from it splits one statement in two. The
//! boundaries now come from a parser, which has no list.
//!
//! `-` and `/` are the discriminating cases: both were absent from that list,
//! and both diverge from upstream on the pre-change tree. `+` and `&&` are in
//! the list and are asserted too — a change that moved them would be reaching
//! past the reported defect.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile failed")
    .js
    .code
}

/// A legacy reactive statement whose right-hand side continues on the next
/// line. Reading it as one statement is what makes `b` a dependency.
fn source_broken_at(op: &str) -> String {
    format!(
        "<script>\n  export let a = 1;\n  export let b = 2;\n  let n = 0;\n  $: v = a {op}\n    b;\n</script>\n\n<p>{{v}}{{n}}</p>\n"
    )
}

fn asserts_single_statement(op: &str) {
    let out = client(&source_broken_at(op));
    assert!(
        out.contains("$.deep_read_state(a()), $.deep_read_state(b())"),
        "`{op}` at end of line split the reactive statement, so `b` is not a dependency:\n{out}"
    );
}

#[test]
fn a_minus_at_end_of_line_does_not_split_the_statement() {
    asserts_single_statement("-");
}

#[test]
fn a_slash_at_end_of_line_does_not_split_the_statement() {
    asserts_single_statement("/");
}

/// The boundaries are read off the program Phase 1 parsed, whose spans are in
/// the *whole* script's coordinates while this pipeline sees the script with
/// its imports already removed. An import above the statement is what makes the
/// two coordinate systems differ, so without it the rebasing is untested.
#[test]
fn an_import_above_the_statement_does_not_shift_the_boundaries() {
    let out = client(
        "<script>\n  import { noop } from './noop.js';\n  export let a = 1;\n  export let b = 2;\n  let n = 0;\n  $: v = a -\n    b;\n  noop;\n</script>\n\n<p>{v}{n}</p>\n",
    );
    assert!(
        out.contains("$.deep_read_state(a()), $.deep_read_state(b())"),
        "the import shifted the statement boundaries:\n{out}"
    );
}

/// Controls: these two were already in the scanner's list, so they held before
/// this change and must still hold.
#[test]
fn a_plus_at_end_of_line_still_does_not_split_the_statement() {
    asserts_single_statement("+");
}

#[test]
fn a_logical_and_at_end_of_line_still_does_not_split_the_statement() {
    asserts_single_statement("&&");
}
