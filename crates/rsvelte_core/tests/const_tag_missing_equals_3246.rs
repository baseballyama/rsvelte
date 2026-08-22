//! `{@const c}` — a const tag with no `=` — compiled, dropped the declaration
//! and left the body referring to a name that was never declared (issue #3246).
//!
//! Upstream's `special()` reads a PATTERN and then `parser.eat('=', true)`, so
//! the missing `=` is reported where the pattern ends, past the whitespace
//! `allow_whitespace` skips. Every position below was measured against
//! `svelte.compile`, which is why `{@const c}` and `{@const c }` differ by a
//! byte: the whitespace is part of what upstream consumes before it looks for
//! the `=`.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn error(src: &str) -> Option<(String, String, u32)> {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .err()
    .map(|err| {
        let d = err.diagnostic();
        (
            d.code.unwrap_or_default(),
            d.message.lines().next().unwrap_or_default().to_string(),
            d.span.map(|(start, _)| start).unwrap_or(u32::MAX),
        )
    })
}

fn assert_error(src: &str, code: &str, message: &str, at: u32) {
    let actual = error(src).unwrap_or_else(|| panic!("must not compile: {src:?}"));
    assert_eq!(
        actual,
        (code.to_string(), message.to_string(), at),
        "for {src:?}"
    );
}

const EXPECTED_EQUALS: &str = "Expected token =";

#[test]
fn a_const_tag_without_an_initializer_is_a_missing_equals() {
    for (src, at) in [
        ("{#if true}{@const c}<b>x</b>{/if}", 19),
        ("{#if true}{@const {a}}<b>x</b>{/if}", 21),
        ("{#if true}{@const [a]}<b>x</b>{/if}", 21),
        ("{#if true}{@const {a = 1}}<b>x</b>{/if}", 25),
        ("{@const c}", 9),
        ("{#each [1] as v}{@const c}<b>x</b>{/each}", 25),
    ] {
        assert_error(src, "expected_token", EXPECTED_EQUALS, at);
    }
}

/// `read_type_annotation` rewinds when there is no `:`, so the whitespace after
/// the pattern is consumed by the `allow_whitespace()` that precedes the `=`.
#[test]
fn the_position_moves_past_the_whitespace_after_the_pattern() {
    for (src, at) in [
        ("{#if true}{@const c }<b>x</b>{/if}", 20),
        ("{#if true}{@const c  }<b>x</b>{/if}", 21),
        ("{#if true}{@const c\n}<b>x</b>{/if}", 20),
    ] {
        assert_error(src, "expected_token", EXPECTED_EQUALS, at);
    }
}

/// A pattern is an identifier or a bracketed destructuring and nothing else, so
/// the `=` is expected right after the name — not after the call or the member
/// access that follows it.
#[test]
fn a_pattern_stops_at_the_identifier() {
    for (src, at) in [
        ("{#if true}{@const f()}<b>x</b>{/if}", 19),
        ("{#if true}{@const a.b}<b>x</b>{/if}", 19),
        ("{#if true}{@const c d}<b>x</b>{/if}", 20),
    ] {
        assert_error(src, "expected_token", EXPECTED_EQUALS, at);
    }
}

#[test]
fn a_body_that_cannot_start_a_pattern_reports_its_own_code() {
    assert_error(
        "{#if true}{@const 1}<b>x</b>{/if}",
        "expected_pattern",
        "Expected identifier or destructure pattern",
        18,
    );
    assert_error(
        "{#if true}{@const let}<b>x</b>{/if}",
        "unexpected_reserved_word",
        "'let' is a reserved word in JavaScript and cannot be used here",
        18,
    );
}

/// The two neighbouring shapes already agreed with upstream before the fix, and
/// have to keep doing so — the missing-`=` branch sits between them.
#[test]
fn the_neighbouring_shapes_are_unchanged() {
    assert_error(
        "{#if true}{@const}<b>x</b>{/if}",
        "expected_whitespace",
        "Expected whitespace",
        17,
    );
    assert_error(
        "{#if true}{@const a = 1, b = 2}<b>x</b>{/if}",
        "const_tag_invalid_expression",
        "{@const ...} must consist of a single variable declaration",
        22,
    );
}

#[test]
fn a_const_tag_with_an_initializer_still_compiles() {
    for src in [
        "{#if true}{@const c = 1}<b>{c}</b>{/if}",
        "{#if true}{@const {a} = {a: 1}}<b>{a}</b>{/if}",
        "{#if true}{@const [a] = [1]}<b>{a}</b>{/if}",
        "{#each [1] as v}{@const d = v * 2}<b>{d}</b>{/each}",
        // A `=` inside a destructuring default is not the assignment.
        "{#if true}{@const {a = 1} = {}}<b>{a}</b>{/if}",
        // Nor is one inside a string, a comparison or an arrow.
        "{#if true}{@const c = '='}<b>{c}</b>{/if}",
        "{#if true}{@const c = 1 === 1}<b>{c}</b>{/if}",
        "{#if true}{@const c = () => 1}<b>{c()}</b>{/if}",
    ] {
        assert_eq!(error(src), None, "must compile: {src:?}");
    }
}
