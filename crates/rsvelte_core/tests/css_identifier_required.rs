//! Upstream reads every CSS name — an at-rule's, a type/class/id/pseudo
//! /attribute selector's, a namespace's local part — with one `read_identifier`
//! (`1-parse/read/style.js:612`), which raises `css_expected_identifier` at the
//! name's start on two rules: a leading `-?\d`, and nothing readable at all.
//!
//! rsvelte answered that question separately at each of the eight call sites.
//! Three asked neither half (`.`, `#`, `::`), three asked only the empty half
//! (`:`, `[`, `ns|`), and the leading-digit rule existed at exactly one of them
//! — so `. { }`, `.a. { }` and `.1a { }` were accepted by `compile()`, not only
//! by `parse()`.
//!
//! Every expected position is the official compiler's, converted from
//! `line:column` to a byte offset. `parse()` and `compile()` are asserted
//! together because the defect was visible in both.

use rsvelte_core::compiler::phases::phase1_parse::{ParseOptions, parse as rust_parse};
use rsvelte_core::error::ParseError;
use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn wrap(body: &str) -> String {
    format!("<p class=\"a a1 a-1 -a 1a\" id=\"a\" title=\"t\"></p>\n<style>\n{body}\n</style>")
}

fn parse_error(source: &str) -> Option<(String, usize)> {
    let alloc = oxc_allocator::Allocator::default();
    match rust_parse(source, &alloc, ParseOptions::default()) {
        Ok(_) => None,
        Err(ParseError::SvelteError { code, span, .. }) => Some((code, span.0)),
        Err(other) => panic!("expected a Svelte error, got {other:?}"),
    }
}

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

/// Asserts the rejection is `css_expected_identifier` at `at`, on both entry
/// points.
fn expect_identifier_error(body: &str, at: usize) {
    let source = wrap(body);
    let want = Some(("css_expected_identifier".to_string(), at));
    assert_eq!(parse_error(&source), want, "parse(): {body:?}");
    assert_eq!(compile_error(&source), want, "compile(): {body:?}");
}

fn expect_accepted(body: &str) {
    let source = wrap(body);
    assert_eq!(parse_error(&source), None, "parse() rejected {body:?}");
    assert_eq!(compile_error(&source), None, "compile() rejected {body:?}");
}

#[test]
fn a_class_or_id_needs_a_name() {
    expect_identifier_error(". { color: red; }", 57);
    expect_identifier_error("# { color: red; }", 57);
    // A second `.` after a complete class selector is the same rule one
    // compound further in, which is what a start-of-selector check would miss.
    expect_identifier_error(".a. { color: red; }", 59);
}

#[test]
fn a_pseudo_element_needs_a_name() {
    expect_identifier_error(":: { color: red; }", 58);
}

#[test]
fn a_pseudo_class_and_an_attribute_still_need_one() {
    expect_identifier_error(": { color: red; }", 57);
    expect_identifier_error("[] { color: red; }", 57);
}

#[test]
fn a_namespace_local_part_and_an_at_rule_still_need_one() {
    expect_identifier_error("*| { color: red; }", 58);
    expect_identifier_error("ns| { color: red; }", 59);
    expect_identifier_error("@ (x) { p { color: red; } }", 57);
}

#[test]
fn a_name_may_not_start_with_a_digit_or_a_hyphen_digit() {
    expect_identifier_error(".1a { color: red; }", 57);
    expect_identifier_error(".-1a { color: red; }", 57);
    expect_identifier_error("#1a { color: red; }", 57);
    expect_identifier_error(":1a { color: red; }", 57);
    expect_identifier_error("[1a] { color: red; }", 57);
    expect_identifier_error("1a { color: red; }", 56);
    expect_identifier_error("@1a (x) { p { color: red; } }", 57);
}

#[test]
fn a_name_that_merely_contains_or_starts_near_a_digit_is_fine() {
    // The rule is `-?\d` at the START, so a leading hyphen, an interior digit
    // and an escaped leading digit are all legal — a check written as "reject a
    // name with a digit near the front" passes every case above and fails here.
    for body in [
        ".a { color: red; }",
        "#a { color: red; }",
        "p:hover { color: red; }",
        "p::before { color: red; }",
        "[title] { color: red; }",
        "p { color: red; }",
        ".-a { color: red; }",
        ".a1 { color: red; }",
        ".a-1 { color: red; }",
        r".\31 a { color: red; }",
        "@media (min-width: 1px) { p { color: red; } }",
    ] {
        expect_accepted(body);
    }
}
