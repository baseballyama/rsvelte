//! Deferred expression parsing must not change which parse error wins.

use rsvelte_core::error::ParseError;
use rsvelte_core::{ParseOptions, parse};

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
