//! A block comment whose host TypeScript construct is erased arrives at the
//! client instance-script normalizer as a slice that is *only* the comment, and
//! esrap prints such a slice with a leading newline. The double-indent guard
//! tested `code.starts_with("/*")`, so that newline made it miss and the
//! re-indent loop added one tab to every continuation line.
//!
//! No corpus gate observes this: `ast_equiv_batch` runs with
//! `CommentPolicy::Ignore`, and the normalized byte comparison (the output
//! family and the pattern-exact family alike) runs both sides through oxfmt,
//! which re-aligns a JSDoc body. Measured on the cell below: raw
//! `base == oracle` is false while normalized `base == oracle` is true. A
//! `pattern-corpus` repro would therefore pin nothing, which README convention 6
//! forbids — this test is the guard.
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

/// The comment's host is erased, so the slice reaching the normalizer is the
/// comment alone. Official indents its continuation lines one level.
#[test]
fn an_erased_host_block_comment_is_indented_once() {
    let out = client(concat!(
        "<script lang=\"ts\">\n",
        "  interface P {\n",
        "  /**\n",
        "   * two\n",
        "   */\n",
        "    a: number\n",
        "  }\n",
        "  let { a }: P = $props()\n",
        "</script>\n",
        "<i>{a}</i>\n"
    ));
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("\n\t * two\n"), "{out}");
    assert!(!out.contains("\n\t\t * two\n"), "{out}");
}

/// The control that a blanket "one tab" rule would break: the host survives, so
/// the comment sits inside an object literal and official indents it *twice*.
/// This cell agreed before the change and must still agree.
#[test]
fn a_surviving_host_keeps_its_own_nesting() {
    let out = client(concat!(
        "<script lang=\"ts\">\n",
        "  const o = {\n",
        "    /**\n",
        "     * two\n",
        "     */\n",
        "    a: 1\n",
        "  };\n",
        "  let a = o.a;\n",
        "</script>\n",
        "<i>{a}</i>\n"
    ));
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("\n\t\t * two\n"), "{out}");
}

/// The second control: a comment that is already the script's first line took
/// the same path before the change (its opener indent and `script_lead` are the
/// same string) and must not move.
#[test]
fn a_script_leading_block_comment_does_not_move() {
    let out = client(concat!(
        "<script lang=\"ts\">\n",
        "  /**\n",
        "   * two\n",
        "   */\n",
        "  let a = 1;\n",
        "</script>\n",
        "<i>{a}</i>\n"
    ));
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("\n\t * two\n"), "{out}");
    assert!(!out.contains("\n\t\t * two\n"), "{out}");
}
