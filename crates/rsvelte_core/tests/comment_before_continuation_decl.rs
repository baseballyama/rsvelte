//! A block comment ends in `/`, and `/` is a division operator.
//!
//! `join_continuation_lines` decides whether a physical line continues onto the
//! next by looking at the last non-whitespace byte it has emitted. Comment text
//! was emitted into that same buffer, so a `/* … */` on its own line made the
//! next line join onto it — and a joined `const` declaration no longer starts
//! with `const`, so `extract_constant_vars` stopped seeing it and the value was
//! read at runtime instead of folded.
//!
//! The pairing that isolates it: a `//` line comment does *not* trigger this,
//! because its last byte is the comment's own text rather than `/`. Both are
//! asserted, so a fix that stops looking at comments entirely still passes while
//! one that special-cases the `)` in the mutant that found this does not — the
//! delimiter was never the cause.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn server(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate: GenerateMode::Server,
            ..Default::default()
        },
    )
    .expect("compile failed")
    .js
    .code
}

/// `const cont = "a\<newline>b"` — a string whose value spans two physical
/// lines through a line continuation. Folding it requires the declaration to be
/// recognised, which requires the comment above it not to swallow it.
fn source_with(comment: &str) -> String {
    format!(
        "<script>\n  let n = $state(0);\n{comment}\n  const cont =\n    \"a\\\n\t\tb\";\n</script>\n\n<p>{{cont}}{{n}}</p>\n"
    )
}

#[test]
fn a_block_comment_does_not_stop_the_next_declaration_folding() {
    let out = server(&source_with("/* c */"));
    assert!(
        out.contains("<p>a\t\tb0</p>"),
        "the constant was read at runtime instead of folded:\n{out}"
    );
}

/// The mutant that found this carried a `)`, which looks like the cause and is
/// not: the plain form above diverges identically.
#[test]
fn the_delimiter_in_the_comment_is_not_the_cause() {
    let out = server(&source_with("/* ) c */"));
    assert!(
        out.contains("<p>a\t\tb0</p>"),
        "the constant was read at runtime instead of folded:\n{out}"
    );
}

/// Control: a `//` comment never ended in `/`, so it always folded. A change
/// that moved this one would be reaching past the reported defect.
#[test]
fn a_line_comment_folds_as_it_always_did() {
    let out = server(&source_with("// c"));
    assert!(
        out.contains("<p>a\t\tb0</p>"),
        "the line-comment control moved:\n{out}"
    );
}

/// Control: with no line continuation the declaration folds whatever precedes
/// it. Both halves are required to reach the defect.
#[test]
fn a_plain_string_folds_with_a_block_comment_above_it() {
    let out = server(
        "<script>\n  let n = $state(0);\n/* ) c */\n  const cont =\n    \"ab\";\n</script>\n\n<p>{cont}{n}</p>\n",
    );
    assert!(
        out.contains("<p>ab0</p>"),
        "the no-continuation control moved:\n{out}"
    );
}
