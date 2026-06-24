//! Blank-line handling between markup siblings and around the document
//! root's `<script>` / `<style>` blocks, matching prettier-plugin-svelte /
//! oxfmt: a single blank line is kept between siblings and where markup abuts
//! a root `<script>` / `<style>`; runs of blank lines collapse to one; and
//! leading/trailing blanks just inside an element are removed.

use rsvelte_formatter::{FormatOptions, format};

fn fmt(src: &str) -> String {
    format(src, &FormatOptions::default()).expect("format ok")
}

#[test]
fn keeps_blank_line_between_script_and_markup() {
    let src = "<script>\n  let x = 1;\n</script>\n\n<div>{x}</div>\n";
    assert_eq!(fmt(src), src);
}

#[test]
fn collapses_multiple_blank_lines_after_script_to_one() {
    let src = "<script>\n  let x = 1;\n</script>\n\n\n<div>{x}</div>\n";
    let want = "<script>\n  let x = 1;\n</script>\n\n<div>{x}</div>\n";
    assert_eq!(fmt(src), want);
}

#[test]
fn keeps_blank_line_before_style() {
    let src = "<div>x</div>\n\n<style>\n  .a {\n    color: red;\n  }\n</style>\n";
    assert_eq!(fmt(src), src);
}

#[test]
fn comment_glued_to_style_keeps_no_blank_between_comment_and_style() {
    // A comment that immediately precedes `<style>` (no blank line between the
    // `-->` and the tag) is the style's leading comment: the blank line goes
    // *before* the comment, not between it and `<style>`. Regression for the
    // section-reorder pass treating the whole markup gap (incl. the trailing
    // comment) as one unit and inserting a blank before `<style>` (#1166).
    let src =
        "<div>x</div>\n\n<!-- keep me glued -->\n<style>\n  .a {\n    color: red;\n  }\n</style>\n";
    assert_eq!(fmt(src), src);
}

#[test]
fn comment_glued_to_style_is_idempotent() {
    let src = "<div>x</div>\n\n<!-- c -->\n<style>\n  .a {\n    color: red;\n  }\n</style>\n";
    let once = fmt(src);
    assert_eq!(fmt(&once), once, "comment-before-style not idempotent");
}

#[test]
fn keeps_single_blank_line_between_siblings() {
    let src = "<div>a</div>\n\n<div>b</div>\n";
    assert_eq!(fmt(src), src);
}

#[test]
fn collapses_double_blank_between_siblings() {
    let src = "<div>a</div>\n\n\n<div>b</div>\n";
    let want = "<div>a</div>\n\n<div>b</div>\n";
    assert_eq!(fmt(src), want);
}

#[test]
fn strips_leading_blank_inside_element() {
    let src = "<div>\n\n  <span>x</span>\n</div>\n";
    let want = "<div>\n  <span>x</span>\n</div>\n";
    assert_eq!(fmt(src), want);
}

#[test]
fn strips_trailing_blank_inside_element() {
    let src = "<div>\n  <span>x</span>\n\n</div>\n";
    let want = "<div>\n  <span>x</span>\n</div>\n";
    assert_eq!(fmt(src), want);
}

#[test]
fn blank_line_handling_is_idempotent() {
    let src = "<script>\n  let x = 1;\n</script>\n\n\n<div>a</div>\n\n\n<div>b</div>\n";
    let once = fmt(src);
    let twice = fmt(&once);
    assert_eq!(once, twice, "blank-line normalization is not idempotent");
}
