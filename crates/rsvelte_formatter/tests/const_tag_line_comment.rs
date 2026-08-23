//! Regression coverage for #3613 — a `{@const}` whose body ends in a `//` comment.
//!
//! Unlike a block header, which splices only the bare expression and so leaves the
//! source newline before `}` alone, `{@const}` prints its own `}`. Two things then
//! go wrong at once: the trailing comment moves the statement's `;` off the end so
//! the suffix strip leaves it in the tag body, and the `}` lands inside the comment.
//! Both make the output something no Svelte parser accepts.

use rsvelte_formatter::{FormatOptions, format};

fn fmt(src: &str) -> String {
    format(src, &FormatOptions::default()).expect("format ok")
}

#[test]
fn a_trailing_line_comment_does_not_swallow_the_closing_brace() {
    let out = fmt("{#if a}{@const x = flag // c\n}{/if}\n");
    assert!(
        !out.contains("// c}"),
        "closing brace inside the comment:\n{out}"
    );
    assert!(
        !out.contains("flag;"),
        "statement semicolon survived:\n{out}"
    );
    assert!(out.contains("// c"), "comment was dropped:\n{out}");
}

#[test]
fn the_fix_is_idempotent() {
    let once = fmt("{#if a}{@const x = flag // c\n}{/if}\n");
    assert_eq!(fmt(&once), once, "second pass changed the output:\n{once}");
}

#[test]
fn a_const_without_a_trailing_comment_is_unchanged() {
    // The control that a blanket "always break before `}`" would break.
    let out = fmt("{#if a}{@const x = flag}{/if}\n");
    assert!(
        out.contains("{@const x = flag}"),
        "single-line const broke:\n{out}"
    );
}

#[test]
fn a_block_comment_is_not_treated_as_a_line_comment() {
    // `/* c */` terminates, so the `}` is safe on the same line and must stay there.
    let out = fmt("{#if a}{@const x = flag /* c */}{/if}\n");
    assert!(
        out.contains("*/}") || out.contains("*/ }"),
        "block comment forced a break:\n{out}"
    );
}

#[test]
fn a_slash_slash_inside_a_string_is_not_a_comment() {
    // The scanner must be quote-aware: `"a//b"` ends in a string, not a comment.
    let out = fmt("{#if a}{@const x = \"a//b\"}{/if}\n");
    assert!(
        out.contains("\"a//b\"}"),
        "string content was read as a comment:\n{out}"
    );
}

#[test]
fn a_regex_literal_is_not_a_line_comment() {
    // `/^\//` ends in `//`; a byte scan reads the rest as a comment and breaks a
    // line that must not break (flowbite-svelte `ComponentsLayout.svelte`).
    let out = fmt("{#if a}{@const p = s.replace(/^\\//, \"\")}{/if}\n");
    assert!(
        out.contains("{@const p = s.replace(/^\\//, \"\")}"),
        "regex literal was read as a comment:\n{out}"
    );
}

#[test]
fn a_regex_literal_followed_by_a_real_comment_still_breaks() {
    let out = fmt("{#if a}{@const p = s.replace(/^\\//, \"\") // c\n}{/if}\n");
    assert!(
        !out.contains("// c}"),
        "closing brace inside the comment:\n{out}"
    );
    assert!(
        !out.contains("\");"),
        "statement semicolon survived:\n{out}"
    );
}
