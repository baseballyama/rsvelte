//! Native CSS formatting via `oxc_formatter_css` — the engine behind embedded
//! `<style>` blocks and standalone `.css`/`.scss`/`.less` files. Pure
//! expected-output assertions (no `oxfmt` subprocess), so it runs anywhere.

use rsvelte_formatter::{CssDialect, CssFormatOptions, css_variant_from_lang, format_css_source};

fn fmt(src: &str, variant: CssDialect) -> String {
    format_css_source(src, variant, &CssFormatOptions::default()).unwrap()
}

#[test]
fn formats_plain_css() {
    assert_eq!(
        fmt(".foo{color:red;background:blue}", CssDialect::Css),
        ".foo {\n  color: red;\n  background: blue;\n}\n"
    );
}

#[test]
fn formats_nested_scss() {
    assert_eq!(
        fmt(".a{.b{color:red}}", CssDialect::Scss),
        ".a {\n  .b {\n    color: red;\n  }\n}\n"
    );
}

#[test]
fn formats_less() {
    // A Less variable declaration round-trips as Less (not mangled as SCSS/CSS).
    assert_eq!(
        fmt("@c:red;.a{color:@c}", CssDialect::Less),
        "@c: red;\n.a {\n  color: @c;\n}\n"
    );
}

#[test]
fn lang_maps_to_dialect() {
    assert_eq!(css_variant_from_lang("scss"), CssDialect::Scss);
    assert_eq!(css_variant_from_lang("less"), CssDialect::Less);
    assert_eq!(css_variant_from_lang("css"), CssDialect::Css);
    assert_eq!(css_variant_from_lang("postcss"), CssDialect::Css);
    // Unknown / empty falls back to plain CSS.
    assert_eq!(css_variant_from_lang("weird"), CssDialect::Css);
}

#[test]
fn parse_error_is_reported() {
    // A declaration missing its `:` is a parse error the caller turns into a
    // verbatim round-trip (mirroring how oxfmt leaves unparseable CSS in place).
    // (The oxc CSS parser is error-tolerant for some truncations — e.g. `.a{color:`
    // now parses as an empty value — but a missing colon still fails.)
    assert!(format_css_source(".a{color", CssDialect::Css, &CssFormatOptions::default()).is_err());
}

#[test]
fn unparseable_style_body_is_spliced_without_a_blank_line() {
    // The style callback's contract is standalone-file shape: base indent 0 and no
    // surrounding newlines. The body starts at the newline after `<style>`, so a
    // fallback returning it verbatim makes the caller's `\n{output}` splice emit two.
    let opts = rsvelte_formatter::FormatOptions::default().with_style_formatter(
        rsvelte_formatter::native_style_formatter(CssFormatOptions::default()),
    );
    // `:is()` takes a selector list, so `2n` is rejected; the CSS parser has no
    // per-rule recovery, so one bad token discards the whole block's formatting.
    let src =
        "<div class=\"a\">x</div>\n\n<style>\n  .a:is(2n) {\n    color: red;\n  }\n</style>\n";
    let out = rsvelte_formatter::format(src, &opts).expect("format ok");
    assert!(
        !out.contains("<style>\n\n"),
        "fallback inserted a blank line:\n{out}"
    );
    assert!(out.contains(".a:is(2n)"), "rule went missing:\n{out}");
}
