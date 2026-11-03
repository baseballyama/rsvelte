//! A `style:` directive's quoted text is a `fill` of its words.
//!
//! prettier-plugin-svelte's `isPreTagContent` keeps attribute text verbatim only
//! for an `Attribute` node, so a `StyleDirective`'s text goes through
//! `fill(splitTextToDocs(node))`: whitespace runs collapse to one breakable
//! space, and a chunk's leading / trailing line break becomes a `hardline` at
//! the attribute indent. Every expected value below is the oxfmt(`svelte: true`)
//! oracle's output at `printWidth: 80`.

use rsvelte_formatter::{FormatOptions, JsFormatOptions, LineWidth, format};

fn fmt(src: &str) -> String {
    let opts = FormatOptions {
        js: JsFormatOptions {
            line_width: LineWidth::try_from(80u16).expect("valid line width"),
            ..JsFormatOptions::default()
        },
        ..FormatOptions::default()
    };
    format(src, &opts).expect("format ok")
}

#[test]
fn a_line_break_inside_the_text_after_an_interpolation_collapses() {
    // svelte.dev `packages/site-kit/src/lib/nav/MobileMenu.svelte`.
    assert_eq!(
        fmt(
            "<div>\n\t<div\n\t\tclass=\"clip\"\n\t\tstyle:--height-difference=\"{menu_height - universal_menu_inner_height}px\"\n\t\tstyle:--context-height-difference=\"calc({menu_height - context_menu_inner_height}px -\n\t\tvar(--context-padding))\"\n\t></div>\n</div>\n"
        ),
        "<div>\n  <div\n    class=\"clip\"\n    style:--height-difference=\"{menu_height - universal_menu_inner_height}px\"\n    style:--context-height-difference=\"calc({menu_height -\n      context_menu_inner_height}px - var(--context-padding))\"\n  ></div>\n</div>\n"
    );
}

#[test]
fn a_collapsed_value_that_fits_puts_the_open_tag_on_one_line() {
    assert_eq!(
        fmt("<div\n\tstyle:--x=\"calc({a - b}px -\n\tvar(--pad))\"\n></div>\n"),
        "<div style:--x=\"calc({a - b}px - var(--pad))\"></div>\n"
    );
    assert_eq!(
        fmt("<div\n\tstyle:--x=\"calc({a - b}px -\n\n\tvar(--pad))\"\n></div>\n"),
        "<div style:--x=\"calc({a - b}px - var(--pad))\"></div>\n"
    );
    assert_eq!(
        fmt("<div\n\tstyle:--x=\"a   b\n\tc\"\n></div>\n"),
        "<div style:--x=\"a b c\"></div>\n"
    );
}

#[test]
fn a_line_break_at_a_chunk_edge_is_a_hardline_at_the_attribute_indent() {
    assert_eq!(
        fmt("<div\n\tstyle:--x=\"{a}\n\tfoo   bar\"\n></div>\n"),
        "<div\n  style:--x=\"{a}\n  foo bar\"\n></div>\n"
    );
    assert_eq!(
        fmt("<div\n\tstyle:--x=\"\n\t{a} px\n\t\"\n></div>\n"),
        "<div\n  style:--x=\"\n  {a} px\n  \"\n></div>\n"
    );
    assert_eq!(
        fmt("<div\n\tstyle:--x=\"{a}\n\n\t{b}\"\n></div>\n"),
        "<div\n  style:--x=\"{a}\n\n  {b}\"\n></div>\n"
    );
}

#[test]
fn the_fill_breaks_between_words_at_the_print_width() {
    assert_eq!(
        fmt(
            "<div style:transform=\"translate(10px, 20px) rotate(45deg) scale(1.5) skew(10deg, 20deg) translateZ(0)\"></div>\n"
        ),
        "<div\n  style:transform=\"translate(10px, 20px) rotate(45deg) scale(1.5) skew(10deg,\n  20deg) translateZ(0)\"\n></div>\n"
    );
    // The fill measures the word alone, so the interpolation stays flat and the
    // break lands before the next word.
    assert_eq!(
        fmt(
            "<div\n\tstyle:--x=\"calc({some_long_variable_name - another_long_variable_name_here}px - var(--pad))\"\n></div>\n"
        ),
        "<div\n  style:--x=\"calc({some_long_variable_name - another_long_variable_name_here}px\n  - var(--pad))\"\n></div>\n"
    );
}

#[test]
fn a_broken_interpolation_before_collapsed_text() {
    assert_eq!(
        fmt(
            "<div\n\tstyle:--x=\"{cond ? some_long_variable_name_here : another_long_variable_name_here_xx}px\n\tfoo {b}\"\n></div>\n"
        ),
        "<div\n  style:--x=\"{cond\n    ? some_long_variable_name_here\n    : another_long_variable_name_here_xx}px foo {b}\"\n></div>\n"
    );
}

#[test]
fn text_inside_pre_and_regular_attribute_text_stay_verbatim() {
    let src = "<pre><span style:--x=\"a   b\"></span></pre>\n";
    assert_eq!(fmt(src), src);
    assert_eq!(
        fmt("<div\n\tstyle=\"calc({a - b}px -\n\tvar(--pad))\"\n></div>\n"),
        "<div\n  style=\"calc({a - b}px -\n\tvar(--pad))\"\n></div>\n"
    );
}
