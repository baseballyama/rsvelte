//! An inline element whose body is only whitespace prints as prettier's
//! `group([...openingTag, '>', line, '</tag>'])`: one space when the whole
//! element fits, otherwise the close tag on the next line at the indent of the
//! line the element starts on. Expected values are oxfmt 0.76.0 (`svelte: true`,
//! the corpus config) on the same source.

use rsvelte_formatter::{FormatOptions, format};

fn fmt(src: &str) -> String {
    let mut options = FormatOptions::default();
    options.js.line_width = oxc_formatter_core::LineWidth::try_from(80).unwrap();
    let once = format(src, &options).expect("format ok");
    let twice = format(&once, &options).expect("format ok");
    assert_eq!(twice, once, "second format moved the output of {src:?}");
    once
}

#[test]
fn the_close_tag_breaks_when_the_element_is_one_column_too_wide() {
    let a54 = "a".repeat(54);
    assert_eq!(
        fmt(&format!(
            "<div>\n\t<i class=\"wx-icon-{a54}\"> </i>\n</div>\n"
        )),
        format!("<div>\n  <i class=\"wx-icon-{a54}\">\n  </i>\n</div>\n"),
    );
}

// Without this cell the one above passes for a printer that always breaks.
#[test]
fn the_element_stays_on_one_line_when_it_fits_exactly() {
    let a53 = "a".repeat(53);
    let src = format!("<div>\n  <i class=\"wx-icon-{a53}\"> </i>\n</div>\n");
    assert_eq!(fmt(&src), src);
}

#[test]
fn a_source_newline_body_breaks_the_same_way() {
    let a29 = "a".repeat(29);
    assert_eq!(
        fmt(&format!(
            "<i class=\"wx-icon-{a29} {{option.icon}} {{option.label}}\">\n</i>\n"
        )),
        format!("<i class=\"wx-icon-{a29} {{option.icon}} {{option.label}}\">\n</i>\n"),
    );
}

#[test]
fn an_open_tag_whose_value_was_wrapped_in_source_breaks_once_flattened() {
    let src = "{#if option.icon}\n\t<i\n\t\tclass=\"wx-icon {option.icon} {!option.label\n\t\t\t? 'wx-only'\n\t\t\t: ''} wx-icon-padding\"\n\t>\n\t</i>\n{/if}\n";
    assert_eq!(
        fmt(src),
        "{#if option.icon}\n  <i\n    class=\"wx-icon {option.icon} {!option.label\n      ? 'wx-only'\n      : ''} wx-icon-padding\"\n  >\n  </i>\n{/if}\n",
    );
}

#[test]
fn the_reported_segmented_shape() {
    let src = "<div>\n\t<div>\n\t\t<div>\n\t\t\t<div>\n\t\t\t\t{#if option.icon}\n\t\t\t\t\t<i\n\t\t\t\t\t\tclass=\"wx-icon {option.icon} {!option.label\n\t\t\t\t\t\t\t? 'wx-only'\n\t\t\t\t\t\t\t: ''}\"\n\t\t\t\t\t>\n\t\t\t\t\t</i>\n\t\t\t\t{/if}\n\t\t\t</div>\n\t\t</div>\n\t</div>\n</div>\n";
    assert_eq!(
        fmt(src),
        "<div>\n  <div>\n    <div>\n      <div>\n        {#if option.icon}\n          <i class=\"wx-icon {option.icon} {!option.label ? 'wx-only' : ''}\">\n          </i>\n        {/if}\n      </div>\n    </div>\n  </div>\n</div>\n",
    );
}

#[test]
fn mid_line_the_close_tag_takes_the_line_indent() {
    let a46 = "a".repeat(46);
    assert_eq!(
        fmt(&format!(
            "<div>\n\tsome text <i class=\"wx-icon-{a46}\"> </i>\n</div>\n"
        )),
        format!("<div>\n  some text <i class=\"wx-icon-{a46}\">\n  </i>\n</div>\n"),
    );
}

// Text glued after the close tag is a separate fill item and does not count.
#[test]
fn glued_trailing_text_does_not_count_toward_the_width() {
    let a46 = "a".repeat(46);
    let src = format!("<div>\n  <i class=\"wx-icon-{a46}\"> </i>text\n</div>\n");
    assert_eq!(fmt(&src), src);
}

#[test]
fn a_block_parent_with_a_sibling_breaks_too() {
    let a58 = "a".repeat(58);
    assert_eq!(
        fmt(&format!(
            "<p>\n\t<i class=\"wx-icon-{a58}\"> </i>\n\t<b>x</b>\n</p>\n"
        )),
        format!("<p>\n  <i class=\"wx-icon-{a58}\">\n  </i>\n  <b>x</b>\n</p>\n"),
    );
}

// The `>` stays glued: a whitespace body is not the empty hug, so an open tag
// exactly at the width keeps its attributes on the tag line.
#[test]
fn an_open_tag_exactly_at_the_width_keeps_its_bracket_glued() {
    let a60 = "a".repeat(60);
    assert_eq!(
        fmt(&format!("<i class=\"wx-icon-{a60}\"> </i>\n")),
        format!("<i class=\"wx-icon-{a60}\">\n</i>\n"),
    );
}

#[test]
fn an_open_tag_one_column_over_the_width_wraps_its_attributes() {
    let a61 = "a".repeat(61);
    assert_eq!(
        fmt(&format!("<i class=\"wx-icon-{a61}\"> </i>\n")),
        format!("<i\n  class=\"wx-icon-{a61}\"\n>\n</i>\n"),
    );
}

// The source-empty element is the hug, and dangles `>` instead.
#[test]
fn a_source_empty_element_still_dangles_its_bracket() {
    let a60 = "a".repeat(60);
    assert_eq!(
        fmt(&format!("<i class=\"wx-icon-{a60}\"></i>\n")),
        format!("<i class=\"wx-icon-{a60}\"\n></i>\n"),
    );
}

// A component, `<slot>` or `svelte:*` element drops a whitespace body, so it is
// the empty hug (`"`\n`></X>`) on both the first and the second format.
#[test]
fn a_component_with_a_whitespace_body_is_the_empty_hug() {
    let a52 = "a".repeat(52);
    let expected = format!(
        "<div>\n  <Typography.Text\n    variant=\"m-500\"\n    color=\"{a52}\"\n  ></Typography.Text>\n</div>\n"
    );
    for body in [" ", "\n  "] {
        let src = format!(
            "<div>\n  <Typography.Text variant=\"m-500\" color=\"{a52}\">{body}</Typography.Text>\n</div>\n"
        );
        assert_eq!(fmt(&src), expected, "{body:?}");
    }
    assert_eq!(fmt(&expected), expected);
}

#[test]
fn a_fitting_component_with_a_whitespace_body_prints_empty_on_one_line() {
    let a40 = "a".repeat(40);
    assert_eq!(
        fmt(&format!(
            "<div>\n  <Comp variant=\"m-500\" color=\"{a40}\">\n  </Comp>\n</div>\n"
        )),
        format!("<div>\n  <Comp variant=\"m-500\" color=\"{a40}\"></Comp>\n</div>\n"),
    );
}

#[test]
fn a_slot_with_a_whitespace_body_is_the_empty_hug() {
    let a52 = "a".repeat(52);
    assert_eq!(
        fmt(&format!(
            "<div>\n  <slot variant=\"m-500\" color=\"{a52}\"> </slot>\n</div>\n"
        )),
        format!("<div>\n  <slot\n    variant=\"m-500\"\n    color=\"{a52}\"\n  ></slot>\n</div>\n"),
    );
}

// The oracle is not idempotent here, and these are its two applications: a
// component whose open tag fits but whose `></Comp>` does not wraps every
// attribute when the body is whitespace, and dangles only `>` once the body is
// source-empty (the second application). appwrite-console `planSummary.svelte`.
#[test]
fn a_component_whose_close_overflows_wraps_then_dangles_like_the_oracle() {
    let a64 = "a".repeat(64);
    let mut options = FormatOptions::default();
    options.js.line_width = oxc_formatter_core::LineWidth::try_from(80).unwrap();
    let once = format(&format!("<Comp class=\"{a64}\"> </Comp>\n"), &options).unwrap();
    assert_eq!(once, format!("<Comp\n  class=\"{a64}\"\n></Comp>\n"));
    let twice = format(&once, &options).unwrap();
    assert_eq!(twice, format!("<Comp class=\"{a64}\"\n></Comp>\n"));
}

// A lowercase custom element keeps its edge whitespace like `<span>`.
#[test]
fn a_custom_element_with_a_whitespace_body_breaks_before_its_close_tag() {
    let a40 = "a".repeat(40);
    let expected =
        format!("<div>\n  <my-el variant=\"m-500\" color=\"{a40}\">\n  </my-el>\n</div>\n");
    assert_eq!(
        fmt(&format!(
            "<div>\n  <my-el variant=\"m-500\" color=\"{a40}\"> </my-el>\n</div>\n"
        )),
        expected,
    );
    assert_eq!(fmt(&expected), expected);
}

// An open tag that does not fit wraps its attributes, as before.
#[test]
fn an_open_tag_that_does_not_fit_still_wraps() {
    let a71 = "a".repeat(71);
    assert_eq!(
        fmt(&format!("<i class=\"wx-icon-{a71}\"> </i>\n")),
        format!("<i\n  class=\"wx-icon-{a71}\"\n>\n</i>\n"),
    );
}
