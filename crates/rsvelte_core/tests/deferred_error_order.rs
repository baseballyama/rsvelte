//! Deferred expression parsing must not change which parse error wins.

use rsvelte_core::error::ParseError;
use rsvelte_core::{ParseOptions, parse, resolve_lazy_expressions};

fn error_code(source: &str) -> String {
    let options = ParseOptions {
        defer_script_parse: true,
        ..Default::default()
    };
    match parse(source, &oxc_allocator::Allocator::default(), options) {
        Ok(_) => panic!("expected a parse error for:\n{source}"),
        Err(ParseError::SvelteError { code, .. }) => code,
        Err(other) => panic!("expected a SvelteError, got {other:?} for:\n{source}"),
    }
}

fn expression_error_code(source: &str, defer: bool) -> String {
    let options = ParseOptions {
        defer_script_parse: defer,
        ..Default::default()
    };
    let mut ast = match parse(source, &oxc_allocator::Allocator::default(), options) {
        Ok(ast) => ast,
        Err(ParseError::SvelteError { code, .. }) => return code,
        Err(other) => panic!("expected a SvelteError, got {other:?} for:\n{source}"),
    };
    match resolve_lazy_expressions(&mut ast, source) {
        Some(ParseError::SvelteError { code, .. }) => code,
        Some(other) => panic!("expected a SvelteError, got {other:?} for:\n{source}"),
        None => panic!("expected a parse error for:\n{source}"),
    }
}

#[test]
fn an_earlier_deferred_expression_error_precedes_a_duplicate_script() {
    let source = r#"<script>let first;</script>
const config = {
  value: 1
};
<script>let second;</script>"#;

    assert_eq!(error_code(source), "expected_token");
}

#[test]
fn duplicate_script_remains_the_error_without_an_earlier_expression_error() {
    let source = "<script>let first;</script>\n<p>text</p>\n<script>let second;</script>";

    assert_eq!(error_code(source), "script_duplicate");
}

#[test]
fn an_error_in_the_second_script_precedes_the_duplicate_error() {
    let source = "<script>let first;</script>\n<script>let = ;</script>";

    assert_eq!(error_code(source), "js_parse_error");
}

#[test]
fn a_deferred_script_error_precedes_a_later_unclosed_block() {
    let source = "<script>let = ;</script>\n{#if true}";

    assert_eq!(error_code(source), "js_parse_error");
}

#[test]
fn deferred_and_eager_mustaches_classify_interface_bodies_identically() {
    // Markdown documentation is compiled as Svelte by the corpus. A raw
    // TypeScript interface body therefore becomes a mustache whose complete
    // leading `src` expression is followed by `:`, so upstream reports the
    // missing `}` rather than a JavaScript parse error.
    let source = "export interface Config {\n  src: string;\n}";

    assert_eq!(expression_error_code(source, false), "expected_token");
    assert_eq!(expression_error_code(source, true), "expected_token");
}
