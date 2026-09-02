//! A leading comment does not stop the hug: the oracle glues `><!-- … -->` to
//! the wrapped open tag exactly as it glues text. Declining to hug left the
//! child to a later pass, whose indent was sliced out of the line prefix — so
//! the comment's `-->` was re-emitted as indentation and overwritten (#4151).
//! Every expectation here was measured against the oxfmt(`svelte: true`) oracle.

use rsvelte_formatter::{
    FormatOptions, IndentStyle, IndentWidth, JsFormatOptions, LineWidth, format,
};

fn fmt(src: &str) -> String {
    let js = JsFormatOptions {
        indent_style: IndentStyle::Space,
        indent_width: IndentWidth::try_from(2u8).unwrap(),
        line_width: LineWidth::try_from(80u16).unwrap(),
        ..JsFormatOptions::default()
    };
    let options = FormatOptions {
        js,
        typescript: false,
        ..FormatOptions::new()
    };
    format(src, &options).expect("format ok")
}

#[test]
fn a_comment_before_a_breaking_child_keeps_its_terminator() {
    assert_eq!(
        fmt(
            "<svg Q=\"1\" R=\"2\"><!-- ZZZZZZZZ --><path d=\"a\"><animate aaaaaaaaaaaaaaaa=\"1\" bbbbbbbbbbbbbbbbbb=\"2\" cccccccccccccccccc=\"3\" /></path></svg>\n"
        ),
        "<svg Q=\"1\" R=\"2\"\n  ><!-- ZZZZZZZZ --><path d=\"a\"\n    ><animate\n      aaaaaaaaaaaaaaaa=\"1\"\n      bbbbbbbbbbbbbbbbbb=\"2\"\n      cccccccccccccccccc=\"3\"\n    /></path\n  ></svg\n>\n"
    );
}

/// The width half of the same defect: valid output, indented at the comment's
/// end column instead of at the element's.
#[test]
fn an_inline_host_indents_at_its_own_column_not_the_comments_end() {
    assert_eq!(
        fmt(
            "<span aaaaaaaaaaaaaaaaaaaa=\"1\"><!-- x --><b d=\"a\"><i aaaaaaaaaaaaaaaa=\"1\" bbbbbbbbbbbbbbbbbb=\"2\" cccccccccccccccccc=\"3\" /></b></span>\n"
        ),
        "<span aaaaaaaaaaaaaaaaaaaa=\"1\"\n  ><!-- x --><b d=\"a\"\n    ><i aaaaaaaaaaaaaaaa=\"1\" bbbbbbbbbbbbbbbbbb=\"2\" cccccccccccccccccc=\"3\" /></b\n  ></span\n>\n"
    );
}

/// A non-breaking child: the same ingredients minus the break, which was
/// already correct and must stay so.
#[test]
fn a_comment_with_a_child_that_fits_is_unchanged() {
    assert_eq!(
        fmt("<svg Q=\"1\" R=\"2\"><!-- ZZZZZZZZ --><path d=\"a\">y</path></svg>\n"),
        "<svg Q=\"1\" R=\"2\"><!-- ZZZZZZZZ --><path d=\"a\">y</path></svg>\n"
    );
}

/// The prefix the relaxed test must keep accepting: a parent's wrapped `>`
/// with nothing else on the line. It passed before the fix, so it is the arm
/// that reports an over-narrowing rather than the defect.
#[test]
fn a_parents_wrapped_bracket_still_hugs_its_child() {
    assert_eq!(
        fmt(
            "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\"><defs><clipPath id=\"cccccccccccccccc\"><rect x=\"0\" y=\"0\" width=\"10\" height=\"10\" /></clipPath></defs></svg>\n"
        ),
        "<svg\n  xmlns=\"http://www.w3.org/2000/svg\"\n  viewBox=\"0 0 24 24\"\n  width=\"24\"\n  height=\"24\"\n  ><defs\n    ><clipPath id=\"cccccccccccccccc\"\n      ><rect x=\"0\" y=\"0\" width=\"10\" height=\"10\" /></clipPath\n    ></defs\n  ></svg\n>\n"
    );
}

/// A block-display host does not hug at all, comment or not — the control that
/// says the relaxation did not reach `never_hugs`.
#[test]
fn a_block_host_still_breaks_instead_of_hugging() {
    assert_eq!(
        fmt(
            "<div Q=\"1\" R=\"2\"><!-- ZZZZZZZZ --><p d=\"a\"><i aaaaaaaaaaaaaaaa=\"1\" bbbbbbbbbbbbbbbbbb=\"2\" cccccccccccccccccc=\"3\" /></p></div>\n"
        ),
        "<div Q=\"1\" R=\"2\">\n  <!-- ZZZZZZZZ -->\n  <p d=\"a\">\n    <i aaaaaaaaaaaaaaaa=\"1\" bbbbbbbbbbbbbbbbbb=\"2\" cccccccccccccccccc=\"3\" />\n  </p>\n</div>\n"
    );
}
