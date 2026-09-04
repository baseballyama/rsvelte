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

/// The three `fmt-oracle-excluded.json` CSS entries. Each form below is
/// `oxfmt <file>.css`'s own output byte-for-byte; `oxfmt(svelte: true)` — which
/// prints embedded CSS through prettier's PostCSS printer — disagrees with oxfmt
/// itself on all three, so matching the oracle would mean matching a tool against
/// its own other answer.
#[test]
fn a_custom_property_value_follows_the_oxc_engine_not_postcss() {
    let out = fmt(
        "div{--bar:   !important;--arr: [1, 2];--sel: a > b ~ c;}",
        CssDialect::Css,
    );
    // oracle: `--bar:    !important;` / `[1, 2]` / `a > b ~c`
    assert!(out.contains("--bar: !important;"), "{out}");
    assert!(out.contains("--arr: [1 , 2];"), "{out}");
    assert!(out.contains("--sel: a > b ~ c;"), "{out}");
}

#[test]
fn a_nested_calc_group_stays_inline_like_the_oxc_engine() {
    let out = fmt(
        ".a{max-width: calc(min(100vw, var(--w)) - (100vw - var(--w) - var(--p) - var(--p)));}",
        CssDialect::Css,
    );
    // The oracle breaks the parenthesized group onto lines of its own.
    assert!(
        out.contains("(100vw - var(--w) - var(--p) -"),
        "inner group was broken out:\n{out}"
    );
}

// ── Deliberate divergences from the `oxfmt(svelte: true)` oracle ─────────────
// These four carry `fmt-known-failures.json` entries. Each asserts BOTH that
// rsvelte's spelling is produced and that the oracle's is absent, so a build
// that stops printing the construct entirely cannot pass.
//
// Measured, not asserted: the official compiler's `js.code` is byte-identical
// for the two spellings and its `css.code` differs only in whitespace (the
// non-whitespace characters are identical). `css.code` byte-identity is not
// available for any CSS whitespace divergence — Svelte carries selectors and
// declarations through scoping close to verbatim, so a moved space in `<style>`
// always moves `css.code`.

#[test]
fn a_column_combinator_keeps_its_spaces() {
    let out = fmt(".a||.b { color: red; }\n", CssDialect::Css);
    assert!(
        out.contains(".a || .b {"),
        "column combinator respacing changed:\n{out}"
    );
    assert!(
        !out.contains(".a||.b"),
        "closed the combinator up like the oracle:\n{out}"
    );
}

#[test]
fn an_nth_child_of_clause_keeps_the_space_after_of() {
    let out = fmt(
        "li:nth-child(2n of.important) { color: red; }\n",
        CssDialect::Css,
    );
    assert!(
        out.contains("(2n of .important)"),
        "`of` respacing changed:\n{out}"
    );
    assert!(
        !out.contains("of.important"),
        "closed `of` up like the oracle:\n{out}"
    );
}

#[test]
fn a_hex_escape_ending_a_selector_keeps_its_own_separator() {
    // The first space terminates the escape; the second separates it from `{`.
    // The oracle emits one, which is the terminator doing both jobs.
    let out = fmt("#\\31\\32\\33 { color: red; }\n", CssDialect::Css);
    assert!(
        out.contains("#\\31\\32\\33  {"),
        "escape separator changed:\n{out}"
    );
    assert!(
        !out.contains("#\\31\\32\\33 {"),
        "merged the two spaces like the oracle:\n{out}"
    );
}

#[test]
fn every_continuation_of_a_multi_value_declaration_sits_at_one_depth() {
    // The oracle's PostCSS path indents the continuations that follow an
    // interleaved comment one level deeper than the first, so its own output is
    // uneven within one declaration.
    let src = ".g {\n\tbackground-image:\n\t\t/* A */\n\t\trepeating-linear-gradient(to right, var(--a) 0, var(--a) 2px, transparent 2px, transparent var(--size)),\n\t\t/* B */\n\t\trepeating-linear-gradient(to right, var(--b) 0, var(--b) 0.5px, transparent 0.5px, transparent calc(var(--size) / 5));\n}\n";
    let out = fmt(src, CssDialect::Css);
    let depths: Vec<usize> = out
        .lines()
        .filter(|l| l.trim_start().starts_with("to right,"))
        .map(|l| l.len() - l.trim_start().len())
        .collect();
    assert_eq!(
        depths.len(),
        2,
        "both continuations must be present:\n{out}"
    );
    assert_eq!(
        depths[0], depths[1],
        "the two continuations sit at different depths:\n{out}"
    );
}
