//! The parser keeps only the first chunk of a quoted `this` value on
//! `<svelte:element>` (`this="h{n}"` compiles as `'h'`, with a warning), so the
//! opener cannot be rebuilt from the node without deleting the rest of the
//! value. prettier-plugin-svelte drops it; the formatter leaves such an opener
//! as written instead.

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
fn text_then_expression_keeps_the_whole_value() {
    let src = "<svelte:element this=\"h{heading_level}\">x</svelte:element>\n";
    assert_eq!(fmt(src), src);
}

#[test]
fn expression_then_text_keeps_the_whole_value() {
    let src = "<svelte:element this=\"{tag}-x\">x</svelte:element>\n";
    assert_eq!(fmt(src), src);
}

#[test]
fn single_quoted_value_with_an_expression_keeps_the_whole_value() {
    let src = "<svelte:element this='h{n}' class=\"a\">x</svelte:element>\n";
    assert_eq!(fmt(src), src);
}

#[test]
fn single_chunk_values_are_still_formatted() {
    assert_eq!(
        fmt("<svelte:element   this=\"div\">x</svelte:element>\n"),
        "<svelte:element this=\"div\">x</svelte:element>\n"
    );
    assert_eq!(
        fmt("<svelte:element   this={ tag }>x</svelte:element>\n"),
        "<svelte:element this={tag}>x</svelte:element>\n"
    );
    assert_eq!(
        fmt("<svelte:element   this=\"{ tag }\">x</svelte:element>\n"),
        "<svelte:element this={tag}>x</svelte:element>\n"
    );
}
