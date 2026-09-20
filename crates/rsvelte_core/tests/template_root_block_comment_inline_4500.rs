//! A block comment the instance script leaves pending is flushed at the
//! template-root declaration. Upstream decides whether a newline follows it by
//! comparing SOURCE lines (esrap: `comment.loc.end.line < to.line`), so it stays
//! inline when `</script>` and the first template element share a line.
//!
//! rsvelte flushes at a `comment_anchor` — a comment-space position standing in
//! for the node's source offset — and the comment buffer ends every chunk with a
//! `'\n'`, so `has_newline_between` read a break for every block comment however
//! the source was written (#4500). The producer now writes that separator byte
//! from the source relationship it already knows, so the printer's existing rule
//! reads the right answer.
//!
//! The axis is the TEMPLATE's line, not the script's: leading newlines inside
//! the script do not move upstream's decision, and the cells below cross the two.
//!
//! Reach in real code is 0 (34,882 `.svelte` files: 1,917 have a block comment in
//! the instance script, 21 have code after `</script>` on the same line, 0 have
//! both), so no corpus gate can hold this and a unit test is the only guard.
//!
//! Every expected string is official Svelte 5.57.0's own output for the same
//! source (`submodules/svelte`, pin `7bc0a70fe`), read off the oracle.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("A.svelte".into()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .map(|result| result.js.code)
    .unwrap_or_else(|error| format!("COMPILE_ERROR: {error:?}"))
}

const INLINE: &str = "\tvar /* c */ b = root();";
const BROKEN: &str = "\tvar /* c */\n\tb = root();";

#[test]
fn a_template_root_on_the_script_line_keeps_the_block_comment_inline() {
    let out = client("<script>/* c */ let { a } = $props();</script><b>{a}</b>");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains(INLINE), "{out}");
}

/// The script's own leading newline is not the axis: the same cell with the
/// comment on its own script line still has `</script><b>` on one line.
#[test]
fn a_leading_newline_inside_the_script_does_not_break_the_line() {
    let out = client("<script>\n/* c */ let { a } = $props();</script><b>{a}</b>");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains(INLINE), "{out}");
}

/// The other side of the axis, and the cell that must NOT move: a newline
/// before the first element is exactly when upstream does break.
#[test]
fn a_template_root_on_its_own_line_still_breaks_after_the_block_comment() {
    let out = client("<script>/* c */ let { a } = $props();</script>\n<b>{a}</b>");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains(BROKEN), "{out}");
}

#[test]
fn a_leading_newline_inside_the_script_does_not_suppress_the_break() {
    let out = client("<script>\n/* c */ let { a } = $props();</script>\n<b>{a}</b>");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains(BROKEN), "{out}");
}

/// A line comment carries its own terminator, so it breaks on both sides of the
/// axis. This cell passes on either arm — it pins that the fix did not widen
/// from "a block comment" to "a comment".
#[test]
fn a_line_comment_still_breaks_when_the_template_root_shares_the_line() {
    let out = client("<script>// c\nlet { a } = $props();</script><b>{a}</b>");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("\tvar // c\n\tb = root();"), "{out}");
}

/// No pending comment at all: the separator the producer writes must not change
/// the declaration when there is nothing to place before it.
#[test]
fn a_template_root_without_a_comment_is_unchanged() {
    let out = client("<script>let { a } = $props();</script><b>{a}</b>");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("\tvar b = root();"), "{out}");
}
