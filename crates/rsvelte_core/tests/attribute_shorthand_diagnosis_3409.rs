//! Issue #3409 — a `{…}` in attribute position that is not a shorthand.
//!
//! Upstream's `read_attribute` reads an **identifier** after the `{`; an empty
//! one is `attribute_empty_shorthand`, reported at the `{`. rsvelte instead
//! brace-scanned the whole body and handed it to the expression parser, so
//! everything that does not begin with an identifier — `{@attac f}` (a one-
//! character typo of `@attach`), `{@ attach f}`, `{@ATTACH f}`, `{@}`,
//! `{@html x}`, `{:x}` — came out as `expected_token` one column late, and the
//! genuinely empty `{}` was reported after the brace rather than at it.
//! `{#…}` / `{/…}` never even reached the check: the attribute loop abandoned
//! the opening tag on them, which upstream does only in loose mode.
//!
//! Every expectation was measured against the official compiler on the same
//! source. `{a.b}` and `{a()}` are the controls — upstream *does* read an
//! identifier there, so they stay `expected_token` at the offending character.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// `(code, start)` of the parse error, or `None` when the source compiles.
fn diagnose(source: &str) -> Option<(String, usize)> {
    match compile(
        source,
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    ) {
        Ok(_) => None,
        Err(err) => {
            let text = format!("{err:?}");
            let code = text
                .split("code: \"")
                .nth(1)
                .and_then(|rest| rest.split('"').next())
                .unwrap_or_default()
                .to_string();
            let start = text
                .split("span: (")
                .nth(1)
                .and_then(|rest| rest.split(',').next())
                .and_then(|n| n.trim().parse::<usize>().ok())
                .unwrap_or(usize::MAX);
            Some((code, start))
        }
    }
}

#[track_caller]
fn assert_empty_shorthand_at_brace(source: &str) {
    let brace = source.find('{').expect("the source has no `{`");
    match diagnose(source) {
        None => panic!("{source:?} compiled; official rejects it"),
        Some((code, start)) => {
            assert_eq!(
                code, "attribute_empty_shorthand",
                "wrong code for {source:?}"
            );
            assert_eq!(start, brace, "wrong point for {source:?}");
        }
    }
}

/// Nothing identifier-like after the `{`: upstream read an empty identifier.
#[test]
fn a_body_that_is_not_an_identifier_is_the_shorthand_error() {
    for source in [
        "<div {@attac f}>x</div>",
        "<div {@ attach f}>x</div>",
        "<div {@ATTACH f}>x</div>",
        "<div {@}>x</div>",
        "<div {@html x}>x</div>",
        "<div {:x}>x</div>",
    ] {
        assert_empty_shorthand_at_brace(source);
    }
}

/// A block token in attribute position is the same error, not an abandoned tag.
#[test]
fn a_block_token_in_attribute_position_is_the_shorthand_error() {
    for source in ["<div {#if a}>x</div>", "<div {/x}>x</div>"] {
        assert_empty_shorthand_at_brace(source);
    }
}

/// An actually empty shorthand points at the `{`, not past it.
#[test]
fn an_empty_shorthand_points_at_the_brace() {
    for source in ["<div {}>x</div>", "<div {  }>x</div>"] {
        assert_empty_shorthand_at_brace(source);
    }
}

/// `start` is taken after any attribute-position comment, so a comment before
/// the `{` must move the point with it rather than leave it behind.
#[test]
fn a_comment_before_the_shorthand_moves_the_point() {
    assert_empty_shorthand_at_brace("<div /* c */ {@attac f}>x</div>");
    assert_empty_shorthand_at_brace("<div id=\"i\" {@attac f}>x</div>");
}

/// The controls: upstream reads an identifier here, so the complaint stays the
/// missing `}` at the offending character.
#[test]
fn a_shorthand_that_starts_with_an_identifier_still_wants_its_brace() {
    for source in ["<div {a.b}>x</div>", "<div {a()}>x</div>"] {
        let (code, start) = diagnose(source).expect("official rejects these too");
        assert_eq!(code, "expected_token", "wrong code for {source:?}");
        assert_eq!(start, 7, "wrong point for {source:?}");
    }
}

/// The controls that compile on both sides.
#[test]
fn the_valid_shorthands_still_compile() {
    for source in [
        "<div {a}>x</div>",
        "<div {...a}>x</div>",
        "<div {@attach f}>x</div>",
    ] {
        assert!(diagnose(source).is_none(), "{source:?} was rejected");
    }
}
