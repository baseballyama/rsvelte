//! Open-tag wrapping uses visual (East Asian) width, matching oxfmt /
//! prettier: a tag that fits in character count but exceeds `printWidth` in
//! display columns — CJK text counts as two columns — must still wrap onto
//! one attribute per line.

use rsvelte_formatter::{FormatOptions, format};

fn fmt(src: &str) -> String {
    format(src, &FormatOptions::default()).expect("format ok")
}

// A CJK description that is < 80 chars but > 80 display columns once the
// fullwidth text is counted as 2 each.
const CJK_TAG: &str = "<Alert pattern=\"info\" description=\"フォームに入力せずに作成した場合、組織名がテナント名になります\" />\n";

#[test]
fn cjk_attribute_wraps_at_print_width() {
    let out = fmt(CJK_TAG);
    assert!(
        out.starts_with("<Alert\n  pattern=\"info\"\n"),
        "CJK-heavy tag should wrap (visual width exceeds printWidth):\n{out}"
    );
    assert!(
        out.contains("\n/>"),
        "self-close should be on its own line:\n{out}"
    );
}

#[test]
fn short_ascii_tag_stays_one_line() {
    let src = "<Alert pattern=\"info\" />\n";
    assert_eq!(fmt(src), src, "short ASCII tag should not wrap");
}

#[test]
fn cjk_width_wrap_is_idempotent() {
    let once = fmt(CJK_TAG);
    let twice = fmt(&once);
    assert_eq!(
        once, twice,
        "CJK width-driven wrap is not idempotent:\n{once}"
    );
}

#[test]
fn class_directive_value_breaks_narrowed_by_its_prefix() {
    // Once the open tag wraps, a `class:NAME={EXPR}` whose full line overflows
    // must break its value where prettier does — the value's wrap budget is
    // narrowed by the `class:NAME=` prefix, matching `style:` / `on:` / `use:`
    // (#795). Without that, the value's own width check (indent only) keeps the
    // 107-column line flat past the 100-column print width.
    let src = "<div\n  role=\"button\"\n  class:template-option-selected={selectedUserDefinedId === templateOption.customPageUserDefinedIdentifier}\n></div>\n";
    let want = "<div\n  role=\"button\"\n  class:template-option-selected={selectedUserDefinedId ===\n    templateOption.customPageUserDefinedIdentifier}\n></div>\n";
    assert_eq!(
        fmt(src),
        want,
        "class directive value not narrowed by prefix"
    );
}

#[test]
fn class_directive_value_that_fits_stays_flat() {
    // A `class:NAME={EXPR}` whose full line fits the print width must NOT break.
    let src = "<div class:active={isActive}></div>\n";
    assert_eq!(fmt(src), src, "short class directive should not wrap");
}
