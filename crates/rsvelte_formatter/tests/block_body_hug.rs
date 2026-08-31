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
//!
//! A display:block body is the other half and it is NOT a hug: the content goes
//! on its own indented line and the close tag on the next. Reaching it needs the
//! same bypass to name `trims_edge_whitespace`, which subsumes `is_block_display`
//! — bypassing only the latter left `<div>` rejected and measured nothing.

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

const C32: &str = "cccccccccccccccccccccccccccccccc";
const C28: &str = "cccccccccccccccccccccccccccc";

#[test]
fn a_block_display_body_takes_the_block_form_not_the_hug() {
    // `trims_edge_whitespace` subsumes `is_block_display`, so a `<div>` body never
    // reached `try_hug_block_inline_body` at all and stayed flat at 81 columns.
    assert_eq!(
        fmt(&format!(
            "{{#if a}}<div class=\"{C32}\"><slot name=\"a\" /></div>{{/if}}\n"
        )),
        format!("{{#if a}}<div class=\"{C32}\">\n    <slot name=\"a\" />\n  </div>{{/if}}\n")
    );
}

#[test]
fn an_inline_body_at_the_same_width_still_hugs() {
    // The control that this is about display and not about width: `<span>` in the
    // identical position with the identical content hugs, as it always did.
    assert_eq!(
        fmt(&format!(
            "{{#if a}}<span class=\"{C32}\"><slot name=\"a\" /></span>{{/if}}\n"
        )),
        format!("{{#if a}}<span class=\"{C32}\"><slot name=\"a\" /></span\n  >{{/if}}\n")
    );
}

#[test]
fn a_block_display_body_that_fits_is_left_alone() {
    let src = format!("{{#if a}}<div class=\"{C28}\"><slot name=\"a\" /></div>{{/if}}\n");
    assert_eq!(fmt(&src), src);
}
