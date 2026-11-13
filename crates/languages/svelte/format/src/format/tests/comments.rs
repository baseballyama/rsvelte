//! The JavaScript comments in the template: where the plugin prints them, and what it deletes.

use super::*;

#[test]
fn what_the_template_printer_cannot_place_yet_is_refused() {
    assert_eq!(
        refusal("<svelte:element this={/* a */ t}></svelte:element>\n"),
        (
            "a comment in `this`, which the plugin prints twice",
            Some("/* a */")
        )
    );
    assert_eq!(
        refusal("<span a // x\n>t</span>\n"),
        (
            "a comment after the last attribute where no line break follows",
            Some("// x")
        )
    );
    assert_eq!(
        refusal("<div /* x\ny */ a></div>\n"),
        (
            "a comment on more than one line among attributes that may stay on one line",
            Some("/* x\ny */")
        )
    );
}

#[test]
fn a_comment_between_attributes_goes_with_the_attribute_as_the_plugin_attaches_it() {
    // Expected outputs from Prettier 3.9.10 with prettier-plugin-svelte 4.1.1.
    for (source_text, expected) in [
        ("<div a /* x */ b></div>", "<div a /* x */ b></div>\n"),
        (
            "<div\n  a\n\n  // x\n\n  b\n></div>",
            "<div\n  a\n  // x\n\n  b\n></div>\n",
        ),
        ("<div a // x\n></div>", "<div\n  a // x\n></div>\n"),
        (
            "<div a\n  /* x */></div>",
            "<div\n  a\n  /* x */\n></div>\n",
        ),
        ("<input a // x\n/>", "<input\n  a // x\n/>\n"),
    ] {
        assert_eq!(formatted(source_text), expected, "{source_text}");
    }
}

#[test]
fn a_comment_the_plugin_deletes_is_refused() {
    for (source_text, why, at) in [
        (
            "<div /* x */></div>",
            "a comment in a tag without attributes, which the plugin deletes",
            "/* x */",
        ),
        (
            "<div a /* > */></div>",
            "a comment after the `>` the plugin takes for the tag's end, which it deletes",
            "/* > */",
        ),
        (
            "{#each xs as { a /* c */ }}{a}{/each}",
            "a comment in a block's pattern, which the plugin deletes",
            "/* c */",
        ),
        (
            "{@debug a /* c */}",
            "a comment in {@debug}, which the plugin deletes",
            "/* c */",
        ),
        (
            "{/* c */ (a)}",
            "a comment outside a template expression's parentheses, which the plugin deletes",
            "/* c */",
        ),
        (
            "<p>{x /* a */}</p>",
            "a comment after a template expression, which the plugin deletes",
            "/* a */",
        ),
    ] {
        assert_eq!(refusal(source_text), (why, Some(at)), "{source_text}");
    }
    // Expected output from Prettier 3.9.10 with prettier-plugin-svelte 4.1.1.
    assert_eq!(formatted("{(/* c */ a)}"), "{/* c */ a}\n");
}

#[test]
fn a_template_expression_keeps_the_comments_before_it() {
    // Expected outputs from Prettier 3.9.10 with prettier-plugin-svelte 4.1.1.
    assert_eq!(formatted("<p>{/* a */ x}</p>\n"), "<p>{/* a */ x}</p>\n");
    assert_eq!(
        formatted("<p title={// a\nx}></p>\n"),
        "<p\n  title={// a\n  x}\n></p>\n"
    );
    assert_eq!(
        formatted("{#if /* a */ x}<p></p>{/if}\n"),
        "{#if /* a */ x}<p></p>{/if}\n"
    );
}
