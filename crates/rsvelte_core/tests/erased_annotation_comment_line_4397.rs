//! A comment left behind by an erased type annotation is flushed at the
//! initializer's start, and the flush wrote a newline after it unconditionally.
//! Upstream's printer decides that from the comment's own line: esrap keeps the
//! comment inline when it sat on the initializer's line in the source, and
//! breaks only when the source broke. So a **one-line** annotation came out on
//! three lines where official keeps one (#4397).
//!
//! The axis is the text between the comment's end and the initializer, not the
//! shape of the annotation and not the shape of the initializer: A7 has a
//! newline *before* the comment and still prints inline, A9's initializer spans
//! lines and still prints inline, and A8 — one newline, after the comment —
//! is the cell that must keep breaking.
//!
//! No corpus gate observes this: `ast_equiv_batch` runs with
//! `CommentPolicy::Ignore`, so a comment-only divergence scores `match` on every
//! target, and a source-shape screen over `compatibility/sources` (33,890
//! `.svelte` files) selects 0 carriers. This test is the whole guard.
//!
//! Every expected string here is official Svelte 5.57.0's own output for the
//! same source (`submodules/svelte`, pin `7bc0a70fe`), not a neighbouring cell's.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

const INLINE: &str = "let a = /* c */ /* c */ { b: 1 };";
const BROKEN: &str = "let a = /* c */\n\t/* c */\n\t{ b: 1 };";

/// The reported cell: annotation, comment and initializer all on one line.
#[test]
fn a_one_line_annotation_keeps_its_comment_on_the_declaration_line() {
    let out = client(concat!(
        "<script lang=\"ts\">\n",
        "\tlet a: { /* c */ b: number } = { b: 1 };\n",
        "</script>\n",
        "<i>{a.b}</i>\n"
    ));
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains(INLINE), "{out}");
}

/// A newline *before* the comment does not break the line: what upstream reads
/// is the distance from the comment to the initializer.
#[test]
fn a_newline_before_the_comment_does_not_break_the_line() {
    let out = client(concat!(
        "<script lang=\"ts\">\n",
        "\tlet a: {\n",
        "\t\t/* c */ b: number } = { b: 1 };\n",
        "</script>\n",
        "<i>{a.b}</i>\n"
    ));
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains(INLINE), "{out}");
}

/// Neither does an initializer that spans lines: the `{` it starts at is still
/// on the comment's line.
#[test]
fn a_multi_line_initializer_does_not_break_the_line() {
    let out = client(concat!(
        "<script lang=\"ts\">\n",
        "\tlet a: { /* c */ b: number } = {\n",
        "\t\tb: 1\n",
        "\t};\n",
        "</script>\n",
        "<i>{a.b}</i>\n"
    ));
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains(INLINE), "{out}");
}

/// The live negative: one newline, between the comment and the initializer.
/// This cell agreed before the change and must still agree.
#[test]
fn a_newline_after_the_comment_still_breaks_the_line() {
    let out = client(concat!(
        "<script lang=\"ts\">\n",
        "\tlet a: { /* c */ b: number\n",
        "\t} = { b: 1 };\n",
        "</script>\n",
        "<i>{a.b}</i>\n"
    ));
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains(BROKEN), "{out}");
}

/// The fully multi-line annotation from #4397's own table, which was already
/// byte-equal and is what localised the defect to the one-line cell.
#[test]
fn a_multi_line_annotation_still_breaks_the_line() {
    let out = client(concat!(
        "<script lang=\"ts\">\n",
        "\tlet a: {\n",
        "\t\t/* c */ b: number\n",
        "\t} = { b: 1 };\n",
        "</script>\n",
        "<i>{a.b}</i>\n"
    ));
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains(BROKEN), "{out}");
}

/// A whole erased *statement* has no flush point, so its comments keep the
/// newline they always had. Official prints both copies on their own lines
/// ahead of the declaration.
#[test]
fn an_erased_type_alias_keeps_its_comments_on_their_own_lines() {
    let out = client(concat!(
        "<script lang=\"ts\">\n",
        "\ttype T = { /* c */ b: number };\n",
        "\tlet a: T = { b: 1 };\n",
        "</script>\n",
        "<i>{a.b}</i>\n"
    ));
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("/* c */\n\t/* c */\n\tlet a = { b: 1 };"),
        "{out}"
    );
}
