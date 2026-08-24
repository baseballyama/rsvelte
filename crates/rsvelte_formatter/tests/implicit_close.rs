//! An element the parser closed implicitly (`<ul><li>a<li>b</ul>`) must be
//! printed with its close tag, like prettier-plugin-svelte. Every expectation
//! here was measured against the oxfmt(`svelte: true`) oracle.

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
fn two_list_items() {
    assert_eq!(
        fmt("<ul><li>a<li>b</ul>\n"),
        "<ul>\n  <li>a</li>\n  <li>b</li>\n</ul>\n"
    );
}

/// One block child does not trigger `forceBreakContent`, so the repaired
/// element stays on its line.
#[test]
fn a_sole_list_item_stays_on_one_line() {
    assert_eq!(fmt("<ul><li>a</ul>\n"), "<ul><li>a</li></ul>\n");
}

#[test]
fn paragraphs() {
    assert_eq!(
        fmt("<div><p>one<p>two</div>\n"),
        "<div>\n  <p>one</p>\n  <p>two</p>\n</div>\n"
    );
}

#[test]
fn description_list_alternates_dt_and_dd() {
    assert_eq!(
        fmt("<dl><dt>a<dd>b<dt>c<dd>d</dl>\n"),
        "<dl>\n  <dt>a</dt>\n  <dd>b</dd>\n  <dt>c</dt>\n  <dd>d</dd>\n</dl>\n"
    );
}

/// The `</span>` sitting at the implicitly-closed `<li>`'s end belongs to the
/// CHILD, so the mismatched-close-tag fallback must not rename it.
#[test]
fn a_child_close_tag_at_the_boundary_is_not_claimed() {
    assert_eq!(
        fmt("<ul><li>a<li><span>x</span></ul>\n"),
        "<ul>\n  <li>a</li>\n  <li><span>x</span></li>\n</ul>\n"
    );
}

/// A row and its last cell close at the same offset; the inner close tag has to
/// be emitted first.
#[test]
fn nested_implicit_closes_nest_inside_out() {
    assert_eq!(
        fmt("<table><tbody><tr><td>a</td><td>b</td><tr><td>c</td><td>d</td></tbody></table>\n"),
        "<table>\n  <tbody><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></tbody>\n</table>\n"
    );
}

#[test]
fn inline_ruby_annotations_stay_glued() {
    assert_eq!(
        fmt("<ruby>a<rt>b<rp>c</ruby>\n"),
        "<ruby>a<rt>b</rt><rp>c</rp></ruby>\n"
    );
}

/// The pre-existing trailing-whitespace shape must keep working — the close tag
/// replaces the whitespace rather than being inserted.
#[test]
fn implicit_close_with_trailing_whitespace() {
    assert_eq!(
        fmt("<ul>\n  <li>a\n  <li>b\n</ul>\n"),
        "<ul>\n  <li>a</li>\n  <li>b</li>\n</ul>\n"
    );
}

#[test]
fn two_repaired_lists_in_a_row() {
    assert_eq!(
        fmt("<ul><li>a<li>b</ul><ul><li>c<li>d</ul>\n"),
        "<ul>\n  <li>a</li>\n  <li>b</li>\n</ul>\n<ul>\n  <li>c</li>\n  <li>d</li>\n</ul>\n"
    );
}

#[test]
fn options_in_a_select() {
    assert_eq!(
        fmt("<select><option>a<option>b</select>\n"),
        "<select><option>a</option><option>b</option></select>\n"
    );
}
