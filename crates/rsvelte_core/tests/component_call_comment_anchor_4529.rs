//! A comment the instance script leaves pending is flushed by the first
//! generated statement whose source position is at or after it. The component
//! call carried no such position, so the flush fell through to the end of the
//! function body — past every statement the template lowered to, which is what
//! the two-component cell below shows and what a one-component cell cannot
//! distinguish from "after the call" (#4529).
//!
//! No corpus gate observes this: `ast_equiv_batch` runs with
//! `CommentPolicy::Ignore`, so a comment-only divergence scores `match` on every
//! target. A source-shape screen over the 34,933 `.svelte` files of the
//! populated submodules selects 140 carriers, of which 4 go from divergent to
//! byte-equal with this change and 0 regress — but none of them can live in
//! `pattern-corpus` for the same reason.
//!
//! Every expected string here is official Svelte 5.57.0's own output for the
//! same source (`submodules/svelte`, pin `7bc0a70fe`), not a neighbouring cell's.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("C.svelte".into()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .map(|result| result.js.code)
    .unwrap_or_else(|error| format!("COMPILE_ERROR: {error:?}"))
}

/// The reported cell: the script holds nothing but the comment.
#[test]
fn a_trailing_script_comment_precedes_the_component_call() {
    let out = client("<script>\n// c\n</script>\n<X />\n");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("\t// c\n\tX($$anchor, {});"), "{out}");
}

/// With a statement before it, so the comment is not simply "the first thing".
#[test]
fn a_statement_before_the_comment_does_not_move_it() {
    let out = client("<script>\nlet p = 1;\n// c\n</script>\n<X {p} />\n");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("\tlet p = 1;\n\n\t// c\n\tX($$anchor, { p });"),
        "{out}"
    );
}

/// The cell that says the old behaviour was "at the end of the body" and not
/// "after the call": with two components the comment used to land past both of
/// them and past `$.append`. A one-component cell cannot tell those apart.
#[test]
fn the_comment_anchors_on_the_first_call_not_at_the_end_of_the_body() {
    let out = client("<script>\n// c\n</script>\n<X /><Y />\n");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("\t// c\n\tX(node, {});"), "{out}");
    assert!(
        !out.contains("$.append($$anchor, fragment);\n\t// c"),
        "{out}"
    );
}

/// The negative: no pending comment, so the anchor must change nothing. Without
/// it, a change that emitted a stray newline or moved the call would still
/// satisfy every assertion above.
#[test]
fn a_script_with_no_comment_is_unchanged() {
    let out = client("<script>\nlet p = 1;\n</script>\n<X {p} />\n");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("\tlet p = 1;\n\n\tX($$anchor, { p });"),
        "{out}"
    );
}
