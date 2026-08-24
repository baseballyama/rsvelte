//! A mustache glued to a preceding tag's `}` is charged for what precedes it on
//! its OUTPUT line, which restarts at the element indent whenever the open tag
//! wraps. Charging the SOURCE column instead broke expressions that fit.
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

const WRAPPED: &str = "<button onclick={() => {}}\n  >{aaaaaaaaaaaaaaaaaaaaaaaaaaaaa}{Bbbbbbbbbbbbbbbbb.ccccccccccc.length}</button\n>\n";

#[test]
fn a_member_chain_that_fits_after_the_open_tag_wraps() {
    assert_eq!(
        fmt(
            "<button onclick={() => {}}>{aaaaaaaaaaaaaaaaaaaaaaaaaaaaa}{Bbbbbbbbbbbbbbbbb.ccccccccccc.length}</button>\n"
        ),
        WRAPPED
    );
}

/// The same document already formatted — the source column and the output
/// column agree here, so this arm passed before the fix and pins that the two
/// inputs still reach one output.
#[test]
fn the_already_formatted_form_is_a_fixed_point() {
    assert_eq!(fmt(WRAPPED), WRAPPED);
}

#[test]
fn an_attributeless_inline_element_wraps_the_same_way() {
    assert_eq!(
        fmt("<span>{aaaaaaaaaaaaaaaaaaaaaaaaaaaaa}{Bbbbbbbbbbbbbbbbb.ccccccccccc.length}</span>\n"),
        "<span\n  >{aaaaaaaaaaaaaaaaaaaaaaaaaaaaa}{Bbbbbbbbbbbbbbbbb.ccccccccccc.length}</span\n>\n"
    );
}

#[test]
fn a_short_glued_lead_still_leaves_the_chain_flat() {
    assert_eq!(
        fmt(
            "<button onclick={() => {}}>{a}{Bbbbbbbbbbbbbbbbbbbbbbbbbb.ccccccccccccccc.length}</button>\n"
        ),
        "<button onclick={() => {}}\n  >{a}{Bbbbbbbbbbbbbbbbbbbbbbbbbb.ccccccccccccccc.length}</button\n>\n"
    );
}

#[test]
fn a_block_element_that_already_fits_is_untouched() {
    let src = "<div>{aaaaaaaaaaaaaaaa}{Bbbbbbbbbbbbbbbbbbbbbbbbbb.ccccccccccccccc.length}</div>\n";
    assert_eq!(fmt(src), src);
}

#[test]
fn two_short_glued_tags_stay_on_one_line() {
    assert_eq!(fmt("<span>{a}{b}</span>\n"), "<span>{a}{b}</span>\n");
}
