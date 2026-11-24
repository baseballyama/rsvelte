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
    // Strict whitespace keeps the tag hugging its content.
    let strict = Options {
        markup_whitespace_sensitivity: crate::options::WhitespaceSensitivity::Strict,
        ..Options::default()
    };
    assert_eq!(
        refusal_with("<span a // x\n>t</span>\n", &strict),
        (
            "a comment after the last attribute where no line break follows",
            Some("// x")
        )
    );
}

#[test]
fn a_comment_between_attributes_goes_with_the_attribute_as_the_plugin_attaches_it() {
    // Expected outputs from Prettier 3.9.10 with prettier-plugin-svelte 4.1.1.
    for (source_text, expected) in [
        ("<div a /* x */ b></div>", "<div a /* x */ b></div>\n"),
        ("<div /* x\ny */ a></div>", "<div /* x\ny */ a></div>\n"),
        ("<div a /* x\ny */ b></div>", "<div a /* x\ny */ b></div>\n"),
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
        // From Prettier 3.10.1 with prettier-plugin-svelte 4.2.0.
        (
            "<span a // x\n>t</span>\n",
            "<span\n  a // x\n>\n  t\n</span>\n",
        ),
        ("<div /* x */></div>", "<div /* x */></div>\n"),
        ("<div a /* > */></div>", "<div a /* > */></div>\n"),
    ] {
        assert_eq!(formatted(source_text), expected, "{source_text}");
    }
}

#[test]
fn a_comment_the_plugin_deletes_is_refused() {
    for (source_text, why, at) in [
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

#[test]
fn a_comment_before_a_bound_sequence_goes_with_the_parentheses_the_plugin_keeps() {
    // Expected outputs from Prettier 3.9.10 with prettier-plugin-svelte 4.1.1.
    for (input, expected) in [
        (
            "<input bind:value={/* Foo */ x, y} />\n",
            "<input bind:value={/* Foo */ (x, y)} />\n",
        ),
        (
            "<input bind:value={\n    /* Foo */\n    x,\n    y\n    }/>\n",
            "<input bind:value={/* Foo */ (x, y)} />\n",
        ),
        (
            "<input bind:value={\n    /** Foo */\n    x,\n    /** Bar */\n    y\n}/>\n",
            "<input\n  bind:value={\n    /** Foo */\n    (x,\n    /** Bar */\n    y)\n  }\n/>\n",
        ),
        (
            "<input bind:value={// a\n() => v, (n) => (v = n)}/>\n",
            "<input\n  bind:value={\n    // a\n    () => v, (n) => (v = n)\n  }\n/>\n",
        ),
        (
            "<input bind:value={\n/**\n * doc\n */\nx, y}/>\n",
            "<input\n  bind:value={\n    /**\n     * doc\n     */\n    x, y\n  }\n/>\n",
        ),
        (
            "<input bind:value={/* a\nb */ x, y}/>\n",
            "<input\n  bind:value={\n    /* a\nb */ (x, y)\n  }\n/>\n",
        ),
        (
            "<input bind:value={/* a */ /* b */ // c\nx, y}/>\n",
            "<input\n  bind:value={\n    /* a */ /* b */ // c\n    (x, y)\n  }\n/>\n",
        ),
        (
            "<input bind:value={/* a */ // b\nx, y}/>\n",
            "<input\n  bind:value={\n    /* a */ // b\n    (x, y)\n  }\n/>\n",
        ),
        (
            "<input bind:value={x, y} />\n",
            "<input bind:value={x, y} />\n",
        ),
    ] {
        assert_eq!(formatted(input), expected, "{input}");
    }
}

#[test]
fn comments_before_a_bound_sequence_the_plugin_leaves_unbalanced_are_refused() {
    // Prettier 3.9.10 with prettier-plugin-svelte 4.1.1 prints `(x, y` without its `)`.
    for (input, at) in [
        ("<input bind:value={// a\n// b\nx, y}/>\n", "// a"),
        (
            "<input bind:value={/* a\nb */\n// c\nx, y}/>\n",
            "/* a\nb */",
        ),
    ] {
        assert_eq!(
            refusal(input),
            (
                "comments before a `bind:` sequence the plugin leaves unbalanced",
                Some(at)
            ),
            "{input}"
        );
    }
}

#[test]
fn a_comment_is_lost_unless_a_kept_span_holds_it_and_the_first_reason_to_drop_it_wins() {
    let what = |comments: &[Span], kept: &[Span], dropped: &[(Span, &'static str)]| {
        let (mut kept, mut dropped) = (kept.to_vec(), dropped.to_vec());
        refuse_lost_comments(comments, &mut kept, &mut dropped)
            .err()
            .map(|refusal| (refusal.what, refusal.span()))
    };
    let s = Span::new;
    // A long kept span before a short one that does not reach the comment still holds it.
    assert_eq!(what(&[s(5, 8)], &[s(4, 6), s(0, 10)], &[]), None);
    assert_eq!(
        what(&[s(2, 3), s(12, 14)], &[s(0, 10), s(11, 13)], &[]),
        Some(("comments in the template's JavaScript", s(12, 14)))
    );
    assert_eq!(
        what(
            &[s(2, 3)],
            &[s(0, 10)],
            &[(s(2, 3), "first"), (s(2, 3), "second")]
        ),
        Some(("first", s(2, 3)))
    );
}
