//! prettier-plugin-svelte collapses whitespace runs inside a `class` attribute
//! value, but only when the attribute sits on a `RegularElement`. Every
//! expectation here was measured against the oxfmt(`svelte: true`) oracle.

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
    let out = format(src, &options).expect("format ok");
    out.strip_suffix('\n').map(str::to_string).unwrap_or(out)
}

#[test]
fn interior_runs_collapse_to_one_space() {
    assert_eq!(
        fmt("<div class=\"a  b   c\"></div>"),
        "<div class=\"a b c\"></div>"
    );
}

#[test]
fn leading_whitespace_survives_and_trailing_is_dropped() {
    assert_eq!(
        fmt("<div class=\"  lead and trail  \"></div>"),
        "<div class=\"  lead and trail\"></div>"
    );
}

#[test]
fn a_whitespace_only_value_is_untouched() {
    assert_eq!(
        fmt("<div class=\"   \"></div>"),
        "<div class=\"   \"></div>"
    );
}

#[test]
fn another_attribute_on_the_same_element_is_untouched() {
    assert_eq!(
        fmt("<div class=\"a  b\" title=\"x  y\"></div>"),
        "<div class=\"a b\" title=\"x  y\"></div>"
    );
}

#[test]
fn trailing_whitespace_before_a_newline_is_dropped() {
    assert_eq!(
        fmt("<div class=\"a  \n  b\"></div>"),
        "<div\n  class=\"a\n  b\"\n></div>"
    );
}

/// Both patterns anchor on a preceding `[^ \t\n]`, so the run that OPENS the
/// text node after an interpolation has nothing to anchor on and survives —
/// only the run inside `a  ` and the value's trailing run are rewritten.
#[test]
fn runs_are_rewritten_per_text_node() {
    assert_eq!(
        fmt("<div class=\"a  {x}  b  \"></div>"),
        "<div class=\"a {x}  b\"></div>"
    );
}

#[test]
fn whitespace_only_text_around_an_interpolation_survives() {
    assert_eq!(
        fmt("<div class=\"{x}  \"></div>"),
        "<div class=\"{x}  \"></div>"
    );
    assert_eq!(
        fmt("<div class=\"  {x}\"></div>"),
        "<div class=\"  {x}\"></div>"
    );
}

#[test]
fn a_component_class_is_not_normalized() {
    assert_eq!(
        fmt("<Comp class=\"a  b  \" />"),
        "<Comp class=\"a  b  \" />"
    );
}

#[test]
fn a_svelte_element_class_is_not_normalized() {
    assert_eq!(
        fmt("<svelte:element this=\"div\" class=\"a  b  \"></svelte:element>"),
        "<svelte:element this=\"div\" class=\"a  b  \"></svelte:element>"
    );
}

#[test]
fn a_slot_class_is_not_normalized() {
    assert_eq!(
        fmt("<slot class=\"a  b  \"></slot>"),
        "<slot class=\"a  b  \"></slot>"
    );
}

#[test]
fn tabs_collapse_like_spaces() {
    assert_eq!(
        fmt("<div class=\"a\t\tb\"></div>"),
        "<div class=\"a b\"></div>"
    );
}
