//! Regression tests for #3593 — `</style` is only a terminator where upstream
//! tests for it.
//!
//! rsvelte searched the raw block bytes for the text `</style` followed by `>`
//! or whitespace. Upstream never runs that test inside a rule: `read_style`
//! passes it to `read_body` as the `finished` predicate, which is consulted
//! only at CSS top level *between* rules, so the CSS grammar consumes strings,
//! comments, blocks and parenthesised values first.
//!
//! Two rows below are the reason the scan needs brace and paren depth and not
//! just string/comment state: an unquoted `url(</style>)` is a declaration
//! value official emits verbatim, and a bare `</style>` one brace deep is CSS
//! official rejects with a CSS error rather than treating as a terminator.
//!
//! These live here rather than in `compatibility/pattern-corpus` because the
//! fmt oracle has the same defect and cannot format the repro at all.
//!
//! Every expectation below is the byte-exact output of the official compiler
//! (Svelte v5.56.9).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn options() -> CompileOptions {
    CompileOptions {
        filename: Some("X.svelte".to_string()),
        generate: GenerateMode::Client,
        dev: false,
        ..Default::default()
    }
}

fn css(body: &str) -> String {
    compile(
        &format!("<b class=\"host\">a</b>\n\n<style>\n{body}\n</style>\n"),
        options(),
    )
    .expect("compile")
    .css
    .expect("css")
    .code
}

#[test]
fn a_terminator_inside_a_string_is_a_declaration_value() {
    for (body, expected) in [
        (
            "\t.host::after { content: \"</style>\"; }",
            "content: \"</style>\"",
        ),
        (
            "\t.host::after { content: '</style>'; }",
            "content: '</style>'",
        ),
        (
            "\t.host { background: url(\"</style>\"); }",
            "url(\"</style>\")",
        ),
        (
            "\t.host::after { content: \"} </style> {\"; }",
            "content: \"} </style> {\"",
        ),
        (
            "\t.host::after { content: \"/* </style> */\"; }",
            "content: \"/* </style> */\"",
        ),
        ("\t@charset \"</style>\";", "@charset \"</style>\""),
    ] {
        assert!(
            css(body).contains(expected),
            "for:\n{body}\ngot:\n{}",
            css(body)
        );
    }
}

#[test]
fn a_terminator_inside_a_comment_is_a_comment() {
    let out = css("\t/* </style> */\n\t.host { color: red; }");
    assert!(out.contains("/* </style> */"), "in:\n{out}");
    assert!(out.contains("color: red"), "in:\n{out}");
}

/// An unquoted `url()` has no string state at all — this row is what makes
/// paren depth load-bearing rather than an optimisation.
#[test]
fn a_terminator_inside_an_unquoted_url_is_a_declaration_value() {
    let out = css("\t@import url(</style>);\n\t.host { background: url(</style>); }");
    assert!(out.contains("@import url(</style>);"), "in:\n{out}");
    assert!(out.contains("background: url(</style>);"), "in:\n{out}");
}

#[test]
fn a_terminator_inside_a_nested_at_rule_is_still_a_value() {
    let out = css("\t@media (min-width: 1px) { .host::after { content: \"</style>\"; } }");
    assert!(out.contains("content: \"</style>\""), "in:\n{out}");
}

/// The negative direction: `</style` one brace deep is not a terminator, so the
/// CSS parser sees it and reports the same code official does.
#[test]
fn a_bare_terminator_inside_a_rule_is_a_css_error() {
    let err = compile(
        "<b class=\"host\">a</b>\n\n<style>\n\t.host { color: red; </style> }\n</style>\n",
        options(),
    )
    .expect_err("must be rejected");
    assert!(
        format!("{err:?}").contains("css_empty_declaration"),
        "{err:?}"
    );
}

/// An unterminated string still runs to the end of the file, which is where
/// official reports it too.
#[test]
fn an_unterminated_string_is_still_unexpected_eof() {
    let err = compile(
        "<b class=\"host\">a</b>\n\n<style>\n\t.host { content: \" }\n</style>\n",
        options(),
    )
    .expect_err("must be rejected");
    assert!(format!("{err:?}").contains("unexpected_eof"), "{err:?}");
}

/// `</style` not followed by `>` or whitespace was never a terminator, and the
/// match stays case-sensitive — both are controls that must not move.
#[test]
fn near_misses_are_not_terminators() {
    assert!(css("\t.host::after { content: \"</style\"; }").contains("\"</style\""));
    assert!(css("\t.host::after { content: \"</STYLE>\"; }").contains("\"</STYLE>\""));
    assert!(css("\t.host::after { content: \"</b>\"; }").contains("\"</b>\""));
}
