//! Pins that a comment adjacent to a `$props()` call does not stop the rune from
//! being lowered (#4471).
//!
//! The client canonicalises the call before its byte matchers run, and that regex
//! admitted a comment only in the gap after `=`. `$props/* c */()` and
//! `$props(/* c */)` matched nothing, so `transform_props_destructuring` returned
//! `None` and its caller read that `None` as *not a props declaration*: the rune
//! reached the output verbatim, giving text that parses and throws
//! `ReferenceError: $props is not defined` at first render.
//!
//! The assertion is a **property**, not byte-equality with the oracle. A comment
//! left in the canonicalised span is still dropped from the client output where
//! official trails it after the declaration's `;` — that is #4448's class, so no
//! comment-bearing input reaches byte-equality yet and a `pattern-corpus` entry
//! would have to be listed in a shrink-only ratchet. This gate holds the half the
//! fix restores; #4448 owns the other half.
//!
//! The whitespace rows are the controls that matter. They were lowered before the
//! fix and after it, and it is the whitespace/comment asymmetry — not the presence
//! of a separator — that named the mechanism.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            generate: GenerateMode::Client,
            dev: false,
            filename: Some("T.svelte".into()),
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code
}

/// A bare `$props` in the output is the defect: it is not imported, not `$$props`,
/// and not a member of anything.
fn rune_survives(code: &str) -> bool {
    code.replace("$$props", "").contains("$props")
}

const COMMENT_GAPS: &[(&str, &str)] = &[
    (
        "between callee and paren",
        "let { a, ...r } = $props/* c */();",
    ),
    ("inside the parens", "let { a, ...r } = $props(/* c */);"),
    (
        "both gaps at once",
        "let { a, ...r } = $props/* c */(/* d */);",
    ),
    (
        "after `=`, already worked",
        "let { a, ...r } = /* c */ $props();",
    ),
];

const WHITESPACE_GAPS: &[(&str, &str)] = &[
    ("space before paren", "let { a, ...r } = $props ();"),
    ("space inside parens", "let { a, ...r } = $props( );"),
    ("newline before paren", "let { a, ...r } = $props\n\t\t();"),
];

fn wrap(decl: &str) -> String {
    format!("<script>\n\t{decl}\n</script>\n\n<p>{{a}}{{r.b}}</p>\n")
}

#[test]
fn a_comment_next_to_the_props_call_still_lowers_the_rune() {
    for (name, decl) in COMMENT_GAPS {
        let code = client(&wrap(decl));
        assert!(
            !rune_survives(&code),
            "{name}: `$props` reached the output\n{code}"
        );
        assert!(
            code.contains("$.rest_props("),
            "{name}: the rest prop was not lowered\n{code}"
        );
    }
}

#[test]
fn whitespace_next_to_the_props_call_was_never_the_axis() {
    for (name, decl) in WHITESPACE_GAPS {
        let code = client(&wrap(decl));
        assert!(
            !rune_survives(&code),
            "{name}: `$props` reached the output\n{code}"
        );
    }
}

/// Without this the two tests above are satisfied by a compiler that lowers any
/// call whose callee is followed by a comment.
///
/// A locally declared `$props` is **not** available as the control: both compilers
/// reject a `$`-prefixed declaration outright (`The $ prefix is reserved`), so an
/// input written that way fails at `expect("compiles")` — which reads as the
/// control firing when it means the control never ran.
#[test]
fn the_widened_gap_does_not_lower_a_different_callee() {
    let code = client(&wrap("let { a, ...r } = other/* c */();"));
    assert!(
        !code.contains("$.rest_props("),
        "a call to `other` was lowered as the props rune\n{code}"
    );
}
