//! Upstream reads a combinator and then requires a compound: `read_selector`
//! consumes only whitespace after it and raises `css_selector_invalid` on the
//! `,`, on the rule's `{` or on the argument list's `)` it finds instead
//! (`1-parse/read/style.js:374-378`). rsvelte raised it from phase 2, so
//! `parse()` — which svelte2tsx, the language server and `rsvelte-lint` consume
//! without analysing — returned a tree for a document the official `parse()`
//! rejects. The pseudo-class scan had its own copy of the check that reported at
//! the end of the TRIMMED argument text rather than at the `)`, and neither copy
//! knew that a comment is not whitespace: upstream leaves it to `read_identifier`
//! and so answers `css_expected_identifier`, at the comment.
//!
//! Every expected position below is the official compiler's, converted from
//! `line:column` to a byte offset.

use rsvelte_core::compiler::phases::phase1_parse::{ParseOptions, parse as rust_parse};
use rsvelte_core::error::ParseError;
use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// `(code, start)` of the first parse error, or `None` when `parse()` accepts.
fn parse_error(source: &str) -> Option<(String, usize)> {
    let alloc = oxc_allocator::Allocator::default();
    match rust_parse(source, &alloc, ParseOptions::default()) {
        Ok(_) => None,
        Err(ParseError::SvelteError { code, span, .. }) => Some((code, span.0)),
        Err(other) => panic!("expected a Svelte error, got {other:?}"),
    }
}

/// `(code, start)` of the first compile error, or `None` when it compiles.
fn compile_error(source: &str) -> Option<(String, usize)> {
    match compile(
        source,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    ) {
        Ok(_) => None,
        Err(err) => {
            let d = err.diagnostic();
            Some((
                d.code.unwrap_or_default(),
                d.span.map_or(0, |(s, _)| s as usize),
            ))
        }
    }
}

fn invalid(source: &str) -> (String, usize) {
    let parsed = parse_error(source);
    assert_eq!(
        parsed,
        compile_error(source),
        "parse() and compile() must agree: {source:?}"
    );
    parsed.unwrap_or_else(|| panic!("expected a rejection: {source:?}"))
}

fn accepted(source: &str) {
    assert_eq!(parse_error(source), None, "parse() rejected {source:?}");
    assert_eq!(compile_error(source), None, "compile() rejected {source:?}");
}

#[test]
fn a_combinator_before_the_rules_brace_is_reported_at_the_brace() {
    for (body, at) in [("p > {", 20), ("p ~ {", 20), ("p + {", 20), ("p || {", 21)] {
        let source = format!("<p></p>\n<style>\n{body}\n\tcolor: red;\n}}\n</style>");
        assert_eq!(
            invalid(&source),
            ("css_selector_invalid".to_string(), at),
            "{body}"
        );
    }
}

#[test]
fn a_combinator_before_the_lists_comma_is_reported_at_the_comma() {
    let source = "<p></p>\n<style>\np > , .a {\n\tcolor: red;\n}\n</style>";
    assert_eq!(invalid(source), ("css_selector_invalid".to_string(), 20));
}

#[test]
fn the_brace_may_be_on_the_next_line() {
    let source = "<p></p>\n<style>\np >\n{\n\tcolor: red;\n}\n</style>";
    assert_eq!(invalid(source), ("css_selector_invalid".to_string(), 20));
}

#[test]
fn a_nested_rule_reports_its_own_brace() {
    for (body, at) in [
        (".x { & > { color: red; } }", 39),
        (".x { > { color: red; } }", 37),
    ] {
        let source = format!("<div class=\"x\"></div>\n<style>\n{body}\n</style>");
        assert_eq!(
            invalid(&source),
            ("css_selector_invalid".to_string(), at),
            "{body}"
        );
    }
}

#[test]
fn a_pseudo_class_argument_is_reported_at_its_closing_paren() {
    // Not at the end of the trimmed argument text: the space before `)` counts.
    for (body, at) in [
        (":is(p > )", 24),
        ("p:not(p > )", 26),
        (":global(p > )", 28),
        (":is(p >, .a)", 23),
    ] {
        let source = format!("<p></p>\n<style>\n{body} {{\n\tcolor: red;\n}}\n</style>");
        assert_eq!(
            invalid(&source),
            ("css_selector_invalid".to_string(), at),
            "{body}"
        );
    }
}

#[test]
fn a_comment_after_a_combinator_is_an_expected_identifier_at_the_comment() {
    // `read_combinator` is followed by `allow_whitespace()`, not by
    // `allow_comment_or_whitespace()`, so the comment is where the next compound
    // has to start — and there is no identifier there.
    // The third case has a real selector after the comment and is still
    // rejected, which is what separates this rule from the trailing one.
    for body in ["p > /* c */ {", "p:is(p > /* c */) {", "p > /* c */ .a {"] {
        let source =
            format!("<p><a class=\"a\"></a></p>\n<style>\n{body}\n\tcolor: red;\n}}\n</style>");
        let comment = source.find("/*").unwrap();
        assert_eq!(
            invalid(&source),
            ("css_expected_identifier".to_string(), comment),
            "{body}"
        );
    }
}

#[test]
fn a_combinator_with_a_compound_after_it_is_still_accepted() {
    for body in [
        "p .a { color: red; }",
        "p > .a { color: red; }",
        "p >.a{ color: red; }",
        "p || .a { color: red; }",
        "p:is(p > .a) { color: red; }",
        "p:not(p > .a) { color: red; }",
        ".x { > .a { color: red; } }",
        "a[title=\"a > b\"] { color: red; }",
    ] {
        accepted(&format!(
            "<div class=\"x\"><p><a class=\"a\" title=\"a > b\"></a></p></div>\n<style>\n{body}\n</style>"
        ));
    }
}
