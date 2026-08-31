//! A block's one-line body hugs even when its content holds a nested element.
//!
//! `element_hug_parts` refused any content containing `<`, so
//! `try_hug_block_inline_body` could not fire on `{#if p}<small><Star /> (x)</small>{/if}`
//! and nothing else reached it — measured against the oxfmt(`svelte: true`) oracle
//! at `printWidth: 80`, rsvelte never broke that shape at any width up to ~147
//! columns, while a plain-text body and an expression-tag body in the identical
//! position were both correct. The caller splices `content` back verbatim, so a
//! nested element in it is safe; the doc-building caller treats it as a text run
//! and still refuses.

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
fn a_block_body_whose_content_holds_an_element_hugs() {
    assert_eq!(
        fmt(
            "{#if product.rating}<small><Star class=\"h-3 w-3 fill-current\" /> ({product.rating})</small>{/if}\n"
        ),
        "{#if product.rating}<small\n    ><Star class=\"h-3 w-3 fill-current\" /> ({product.rating})</small\n  >{/if}\n"
    );
}

#[test]
fn the_same_body_with_an_attribute_hugs() {
    assert_eq!(
        fmt(
            "{#if product.rating}<small class=\"x\"><Star class=\"h-3 w-3 fill\" /> ({product.rating})</small>{/if}\n"
        ),
        "{#if product.rating}<small class=\"x\"\n    ><Star class=\"h-3 w-3 fill\" /> ({product.rating})</small\n  >{/if}\n"
    );
}

#[test]
fn a_plain_text_body_was_already_correct() {
    // The control that located the guard: the identical position with no `<` in
    // the content has always hugged.
    assert_eq!(
        fmt(
            "{#if r}<small>the quick brown fox jumps over the lazy dog and then some more</small>{/if}\n"
        ),
        "{#if r}<small\n    >the quick brown fox jumps over the lazy dog and then some more</small\n  >{/if}\n"
    );
}

#[test]
fn a_body_that_fits_is_left_alone() {
    assert_eq!(
        fmt("{#if r}<small><Star /> ({r})</small>{/if}\n"),
        "{#if r}<small><Star /> ({r})</small>{/if}\n"
    );
}

#[test]
fn an_element_parent_hugs_the_parent_not_the_child() {
    assert_eq!(
        fmt(
            "<span><small><Star class=\"h-3 w-3 fill-current\" /> ({product.rating})</small></span>\n"
        ),
        "<span\n  ><small><Star class=\"h-3 w-3 fill-current\" /> ({product.rating})</small></span\n>\n"
    );
}
