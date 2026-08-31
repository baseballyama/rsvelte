//! Upstream decides whether a block item is a declaration or a nested rule with
//! `read_value` (`1-parse/read/style.js:508`), whose only bracket is `url(`:
//! every other `(` or `[` is ordinary text, so a `{` inside one still ends the
//! value. Reaching EOF there throws `unexpected_eof` rather than answering the
//! question. rsvelte counted paren and bracket depth and answered "declaration"
//! at EOF, so an SCSS `#{…}` interpolation inside `var(…)` compiled where
//! official rejects it.
//!
//! Every expectation below is the official compiler's own output on the same
//! source (Svelte 5.56.10). Positions are byte offsets; the sources are ASCII,
//! so they equal official's UTF-16 `character`.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

/// `Ok` when the component compiles, otherwise `(code, start)`.
fn verdict(src: &str) -> Result<(), (String, u32)> {
    match compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    ) {
        Ok(_) => Ok(()),
        Err(e) => {
            let d = e.diagnostic();
            Err((
                d.code.unwrap_or_default(),
                d.span.map_or(0, |(start, _)| start),
            ))
        }
    }
}

fn expect_error(src: &str, code: &str, at: usize, label: &str) {
    assert_eq!(
        verdict(src),
        Err((code.to_string(), at as u32)),
        "{label}\n{src}"
    );
}

#[test]
fn a_brace_inside_any_bracket_but_url_still_ends_the_value() {
    // Upstream stops the value scan at the `{` of `#{$y}` and reads the item as
    // a rule, so `read_selector` eats `color`, then `:`, then asks for an
    // identifier at the space.
    let scss =
        "<p>x</p>\n\n<style lang=\"scss\">\n\t.a {\n\t\tcolor: var(--x, #{$y});\n\t}\n</style>\n";
    expect_error(
        scss,
        "css_expected_identifier",
        scss.find("color:").unwrap() + "color:".len(),
        "paren-wrapped brace",
    );

    // The same for a bracket, and for a plain (non-SCSS) `<style>`.
    let bracket = "<p>x</p>\n\n<style lang=\"scss\">\n\t.a {\n\t\tgrid-template-columns: [full-start] minmax(1rem, 1fr) [b{c] 1fr;\n\t}\n</style>\n";
    expect_error(
        bracket,
        "css_expected_identifier",
        bracket.find("grid-template-columns:").unwrap() + "grid-template-columns:".len(),
        "bracket-wrapped brace",
    );

    let plain = "<p>x</p>\n\n<style>\n\t.a {\n\t\tcolor: rgb(1, 2, 3) attr({);\n\t}\n</style>\n";
    expect_error(
        plain,
        "css_expected_identifier",
        plain.find("color:").unwrap() + "color:".len(),
        "plain paren brace",
    );
}

#[test]
fn url_is_the_one_bracket_the_value_scan_tracks() {
    // The negative control for the row above: inside `url(`, `;` and `{` are
    // part of the value, so official accepts this and so must rsvelte. Without
    // it, "remove the depth counters" would read as "terminate on every brace".
    let src = "<p>x</p>\n\n<style>\n\t.a {\n\t\tbackground: url(a;b{c);\n\t}\n</style>\n";
    assert_eq!(verdict(src), Ok(()), "{src}");
}

#[test]
fn a_value_scan_that_reaches_eof_is_unexpected_eof() {
    // `//` is not a CSS comment, so the apostrophe in `can't` opens a string
    // that swallows every terminator; upstream's `read_value` runs out of input
    // and throws at `parser.template.length` (the right-trimmed template).
    let src = "<p>x</p>\n\n<style lang=\"scss\">\n\t.a {\n\t\t// can't be scoped\n\t}\n</style>\n";
    expect_error(
        src,
        "unexpected_eof",
        src.trim_end().len(),
        "value scan reaching EOF",
    );

    // Two apostrophes balance, so the string closes and the scan still reaches
    // EOF with no `{` behind it — the answer is the same.
    let balanced = "<p>content</p>\n\n<style lang=\"scss\">\n\t.a {\n\t\t// can't be scoped here\n\t}\n\t// isn't a CSS comment\n</style>\n";
    expect_error(
        balanced,
        "unexpected_eof",
        balanced.trim_end().len(),
        "balanced apostrophes reaching EOF",
    );
}

#[test]
fn a_selector_error_outranks_a_later_missing_semicolon() {
    // Upstream parses the whole body before `eat('</style', true)`, and throws
    // at the first CSS error. The `//` is where `read_identifier` fails; the
    // declaration terminator further on is never reached.
    let src = "<p>content</p>\n\n<style lang=\"scss\">\n\t// for height transition with fit-content and auto, etc.\n\t@supports (interpolate-size: allow-keywords) {\n</style>\n";
    expect_error(
        src,
        "css_expected_identifier",
        src.find("//").unwrap(),
        "selector error before the terminator error",
    );
}

#[test]
fn a_line_comment_that_reaches_a_brace_is_still_an_identifier_error() {
    // The opposite answer of `a_value_scan_that_reaches_eof_is_unexpected_eof`
    // on the same construct: here the scan finds a `{`, takes the rule path and
    // fails on the slash. Both rows are needed to tell the two apart.
    for src in [
        "<p>x</p>\n\n<style lang=\"scss\">\n\t.a {\n\t\t// note\n\t\t@supports (interpolate-size: allow-keywords) {\n\t\t\tinterpolate-size: allow-keywords;\n\t\t}\n\t}\n</style>\n",
        "<p>x</p>\n\n<style lang=\"scss\">\n\t// note\n\t.a {\n\t\tcolor: red;\n\t}\n</style>\n",
    ] {
        expect_error(
            src,
            "css_expected_identifier",
            src.find("//").unwrap(),
            "line comment reaching a brace",
        );
    }
}

#[test]
fn a_plain_paren_is_not_a_bracket_the_value_scan_balances() {
    // `url(` is the only one, so a `;` or `}` inside `calc(` / `attr(` still
    // terminates the value. Both parens here are balanced, which is what keeps
    // this row about the value scan alone rather than about the `</style`
    // search (`style_close_tag_scan_3281.rs` owns that half).
    //
    // `calc(1;2)`: the value ends at the `;`, so `2)` is read as the next block
    // item — a property with no value.
    let semi = "<p class=\"a\">x</p>\n\n<style>\n\t.a {\n\t\tcolor: calc(1;2);\n\t}\n</style>\n";
    expect_error(
        semi,
        "css_empty_declaration",
        semi.find("2)").unwrap(),
        "semicolon inside calc(",
    );

    // `attr(x}y)`: the value ends at the `}`, which closes the rule, and `y)`
    // is then a selector.
    let brace = "<p class=\"a\">x</p>\n\n<style>\n\t.a {\n\t\tcolor: attr(x}y);\n\t}\n</style>\n";
    expect_error(
        brace,
        "css_expected_identifier",
        brace.find("y)").unwrap() + 1,
        "brace inside attr(",
    );
}
