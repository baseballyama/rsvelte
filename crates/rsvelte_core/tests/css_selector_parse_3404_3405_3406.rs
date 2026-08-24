//! CSS combinator tokens (#3404), malformed selectors (#3405) and a
//! declaration with no property name (#3406, item 1).
//!
//! Every expectation is the official compiler's verbatim answer at the pinned
//! Svelte revision. The three families need opposite controls: `>>` / `||` are
//! inputs official *accepts* and rsvelte rewrote or rejected, while the `[…]`
//! and comma shapes are inputs official *rejects* and rsvelte compiled — two of
//! them into a stylesheet no CSS parser accepts.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

const MARKUP: &str = "<div class=\"card\"><a class=\"a\" x=\"y\"><b class=\"b\">t</b></a></div>";

enum Outcome {
    Css(&'static str),
    Error(&'static str, usize, usize),
}

fn check(style: &str, expected: Outcome) {
    let source = format!("{MARKUP}\n<style>\n\t{style}\n</style>\n");
    let result = compile(
        &source,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    );
    match (result, expected) {
        (Ok(ok), Outcome::Css(css)) => assert_eq!(
            ok.css.map(|c| c.code).unwrap_or_default(),
            css,
            "for `{style}`"
        ),
        (Err(err), Outcome::Error(code, line, column)) => {
            let diagnostic = err.diagnostic();
            let span = diagnostic.span.expect("a coded error carries a span");
            let position = rsvelte_core::compiler::source_position(&source, span.0);
            assert_eq!(
                (
                    diagnostic.code.as_deref().unwrap_or("?"),
                    position.line,
                    position.column
                ),
                (code, line, column),
                "for `{style}`"
            );
        }
        (Ok(ok), Outcome::Error(code, ..)) => panic!(
            "`{style}` compiled but official raises {code}: {:?}",
            ok.css.map(|c| c.code)
        ),
        (Err(err), Outcome::Css(_)) => panic!(
            "`{style}` was rejected but official compiles it: {:?}",
            err.diagnostic()
        ),
    }
}

/// `>>` and `>>>` are a *run* of combinator tokens: upstream's regex reads one
/// at a time and keeps the last, but its in-place rewrite leaves the whole run
/// in the output, so collapsing the run to `>` changes what the rule selects.
#[test]
fn a_combinator_run_survives_into_the_output() {
    check(
        ".card >> .a { color: red }",
        Outcome::Css("\n\t.card.svelte-70s02x >> .a:where(.svelte-70s02x) { color: red }\n"),
    );
    check(
        ".card >>> .a { color: red }",
        Outcome::Css("\n\t.card.svelte-70s02x >>> .a:where(.svelte-70s02x) { color: red }\n"),
    );
    check(
        ".card>>.a { color: red }",
        Outcome::Css("\n\t.card.svelte-70s02x>>.a:where(.svelte-70s02x) { color: red }\n"),
    );
    check(
        ".card { >> .a { color: red } }",
        Outcome::Css("\n\t.card.svelte-70s02x { >> .a:where(.svelte-70s02x) { color: red } }\n"),
    );
    check(
        ".card { >>> .a { color: red } }",
        Outcome::Css("\n\t.card.svelte-70s02x { >>> .a:where(.svelte-70s02x) { color: red } }\n"),
    );
    // Controls: a single `>` is unchanged, and `::deep` is not a combinator.
    check(
        ".card > .a { color: red }",
        Outcome::Css("\n\t.card.svelte-70s02x > .a:where(.svelte-70s02x) { color: red }\n"),
    );
    check(
        ".card ::deep .a { color: red }",
        Outcome::Css("\n\t/* (unused) .card ::deep .a { color: red }*/\n"),
    );
}

/// `REGEX_COMBINATOR` accepts `||`; a lone `|` stays a namespace separator, so
/// reading two bytes is what separates the two.
#[test]
fn the_column_combinator_is_read_and_a_lone_bar_is_not() {
    let source = format!("{MARKUP}\n<style>\n\t.a || .b {{ color: red }}\n</style>\n");
    assert!(
        compile(
            &source,
            CompileOptions {
                filename: Some("Main.svelte".to_string()),
                generate: GenerateMode::Client,
                dev: false,
                css: CssMode::External,
                ..Default::default()
            },
        )
        .is_ok(),
        "`||` is a combinator official accepts"
    );
    check(
        ".a | .b { color: red }",
        Outcome::Error("css_expected_identifier", 3, 4),
    );
}

/// A namespaced attribute name is not Svelte input; rsvelte used to drop the
/// name and emit `[]`, which no CSS parser accepts.
#[test]
fn a_namespaced_attribute_name_is_rejected_instead_of_emitting_empty_brackets() {
    check(
        "[*|data-k] { color: red }",
        Outcome::Error("css_expected_identifier", 3, 2),
    );
    check(
        "[|data-k] { color: red }",
        Outcome::Error("css_expected_identifier", 3, 2),
    );
    check(
        "[svg|data-k] { color: red }",
        Outcome::Error("expected_token", 3, 5),
    );
}

/// `parser.eat(']', true)` — anything else ends the selector rather than being
/// skipped over, and a matcher prefix with no `=` after it consumes nothing.
#[test]
fn an_unterminated_attribute_selector_is_rejected() {
    check("[x { color: red }", Outcome::Error("expected_token", 3, 4));
    check(
        "[x|] { color: red }",
        Outcome::Error("expected_token", 3, 3),
    );
    check(
        "[x^] { color: red }",
        Outcome::Error("expected_token", 3, 3),
    );
}

/// The attribute shapes that already agreed. `[x i]` is the discriminating one:
/// the flags were read inside the matcher branch, so a flag with no matcher was
/// silently skipped instead of parsed.
#[test]
fn well_formed_attribute_selectors_are_unchanged() {
    check(
        "[x] { color: red }",
        Outcome::Css("\n\t[x].svelte-70s02x { color: red }\n"),
    );
    check(
        "[x|=\"y\"] { color: red }",
        Outcome::Css("\n\t[x|=\"y\"].svelte-70s02x { color: red }\n"),
    );
    check(
        "[x=\"y\" i] { color: red }",
        Outcome::Css("\n\t[x=\"y\" i].svelte-70s02x { color: red }\n"),
    );
    check(
        "[x=\"y\" s] { color: red }",
        Outcome::Css("\n\t[x=\"y\" s].svelte-70s02x { color: red }\n"),
    );
    check(
        "[x i] { color: red }",
        Outcome::Css("\n\t[x i].svelte-70s02x { color: red }\n"),
    );
}

/// Upstream rewrites the stylesheet in place and never touches the brackets, so
/// the author's spacing survives — `name` / `matcher` / `value` cannot carry it,
/// and a printer that rebuilds the selector from them normalises it away.
#[test]
fn an_attribute_selector_keeps_the_source_spacing() {
    check(
        "[ x ] { color: red }",
        Outcome::Css("\n\t[ x ].svelte-70s02x { color: red }\n"),
    );
    check(
        "[ x = \"y\" ] { color: red }",
        Outcome::Css("\n\t[ x = \"y\" ].svelte-70s02x { color: red }\n"),
    );
    check(
        "[x~=\'y\'] { color: red }",
        Outcome::Css("\n\t[x~=\'y\'].svelte-70s02x { color: red }\n"),
    );
    // Control: brackets holding only whitespace are still rejected.
    check(
        "[  ] { color: red }",
        Outcome::Error("css_expected_identifier", 3, 4),
    );
}

/// An empty comma-separated segment reaches `read_identifier` upstream, which
/// raises at the index the leading whitespace and comments were consumed to.
#[test]
fn an_empty_selector_list_entry_is_rejected() {
    check(
        ".a, { color: red }",
        Outcome::Error("css_expected_identifier", 3, 5),
    );
    check(
        ", .a { color: red }",
        Outcome::Error("css_expected_identifier", 3, 1),
    );
    check(
        ".a,, .b { color: red }",
        Outcome::Error("css_expected_identifier", 3, 4),
    );
    check(
        ", { color: red }",
        Outcome::Error("css_expected_identifier", 3, 1),
    );
    // Control: no selector at all is rejected by both, so the parser is not
    // uniformly permissive here.
    check(
        "{ color: red }",
        Outcome::Error("css_expected_identifier", 3, 1),
    );
}

/// Upstream's rule is `!value && !property.startsWith('--')`, so an empty
/// *property* is not on its own an error — the declaration is passed through.
#[test]
fn a_declaration_with_no_property_name_compiles() {
    check(
        ".a { : red }",
        Outcome::Css("\n\t.a.svelte-70s02x { : red }\n"),
    );
    // Controls: a space before the colon is untouched, and an empty *value*
    // still raises.
    check(
        ".a { color : red }",
        Outcome::Css("\n\t.a.svelte-70s02x { color : red }\n"),
    );
    check(
        ".a { color: }",
        Outcome::Error("css_empty_declaration", 3, 6),
    );
}
