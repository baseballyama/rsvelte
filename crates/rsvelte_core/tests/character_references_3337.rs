//! Three character-reference decoder disagreements found in one 560-cell sweep
//! (issue #3337), each reachable only through a different axis of that sweep:
//!
//! 1. `&#X41;` — upstream's `#(?:x[a-fA-F\d]+|\d+)` spells the marker
//!    lowercase, so an uppercase `X` is not a character reference at all.
//!    rsvelte accepted both spellings.
//! 2. A surrogate half or an out-of-range code point — `validate_code` returns
//!    0 and upstream then emits `String.fromCodePoint(0)`, a literal NUL.
//!    rsvelte treated the 0 as "undecodable" and left the source text.
//! 3. `<textarea>` decodes through `read_sequence`, which passes
//!    `is_attribute_value: true`, so the semicolon-less legacy names do NOT
//!    apply there. rsvelte decoded `&notit` to `¬it` inside a textarea only.
//!
//! The controls are load-bearing: `&#x80;` (Windows-1252), `&#xFFFE;` (a
//! noncharacter), `&#0;` and the astral rows all agree on both sides already,
//! so "anything unusual is undecodable" — and the spec's U+FFFD, which neither
//! compiler emits — fail them.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn render(markup: &str, generate: GenerateMode) -> String {
    compile(
        markup,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .unwrap_or_else(|e| panic!("expected {markup:?} to compile, got {e:?}"))
    .js
    .code
}

fn client(markup: &str) -> String {
    render(markup, GenerateMode::Client)
}

fn server(markup: &str) -> String {
    render(markup, GenerateMode::Server)
}

#[test]
fn uppercase_hex_marker_is_not_a_character_reference() {
    let code = client("<p>&#X41;</p>");
    assert!(code.contains("<p>&#X41;</p>"), "{code}");
    assert!(!code.contains("<p>A</p>"), "{code}");
    // The server escapes the ampersand it did not consume.
    assert!(server("<p>&#X41;</p>").contains("<p>&amp;#X41;</p>"));
}

#[test]
fn lowercase_hex_marker_is_the_control() {
    // The client emits raw HTML into `from_html`, so the reference survives
    // there on both sides; the server is where the decode is observable.
    assert!(client("<p>&#x41;</p>").contains("<p>&#x41;</p>"));
    assert!(server("<p>&#x41;</p>").contains("<p>A</p>"));
}

#[test]
fn uppercase_marker_stays_literal_in_every_host() {
    for markup in [
        "<p title=\"&#X41;\">x</p>",
        "<p title='&#X41;'>x</p>",
        "<p title=&#X41;>x</p>",
        "<textarea>&#X41;</textarea>",
        "<title>&#X41;</title>",
    ] {
        let code = server(markup);
        assert!(
            code.contains("&amp;#X41;") || code.contains("&#X41;"),
            "{markup}: expected the reference to stay literal, got {code}"
        );
        assert!(
            !code.contains(">A<") && !code.contains("=\"A\""),
            "{markup}: decoded, got {code}"
        );
    }
}

/// `validate_code` answers 0 for a surrogate half and for anything above the
/// planes it lists, and upstream turns that 0 into a NUL rather than into "no
/// decode". Neither side follows HTML here (which says U+FFFD); byte equality
/// with official is the requirement.
#[test]
fn surrogates_and_out_of_range_become_nul() {
    for reference in ["&#xD800;", "&#xDFFF;", "&#x110000;", "&#x10FFFF;"] {
        let code = server(&format!("<p>{reference}</p>"));
        assert!(
            code.contains('\u{0}'),
            "{reference}: expected a NUL in the output, got {code:?}"
        );
        assert!(
            !code.contains(reference),
            "{reference}: left undecoded, got {code:?}"
        );
    }
}

/// The four numeric rows that make the one above a statement about surrogates
/// and range rather than about "unusual code points".
#[test]
fn numeric_controls_are_unchanged() {
    // Windows-1252 remap.
    assert!(server("<p>&#x80;</p>").contains('\u{20AC}'));
    // A noncharacter is passed through.
    assert!(server("<p>&#xFFFE;</p>").contains('\u{FFFE}'));
    assert!(server("<p>&#xFFFD;</p>").contains('\u{FFFD}'));
    // A falsy code is left undecoded by both compilers.
    assert!(server("<p>&#0;</p>").contains("&amp;#0;"));
    // Astral planes decode; this is not "anything above U+FFFF".
    for reference in ["&#x1F600;", "&#128512;"] {
        assert!(
            server(&format!("<p>{reference}</p>")).contains('\u{1F600}'),
            "{reference}"
        );
    }
    assert!(server("<p>&#x1D11E;</p>").contains('\u{1D11E}'));
    assert!(server("<p>&#x10000;</p>").contains('\u{10000}'));
}

/// A digit run longer than any cap: `parseInt` widens past 2^32 into a float
/// `validate_code` rejects, so the whole run is consumed and becomes a NUL.
#[test]
fn an_overlong_digit_run_is_consumed_whole() {
    let code = server("<p>&#111111111111111111111;</p>");
    assert!(code.contains('\u{0}'), "{code:?}");
    assert!(
        !code.contains("111"),
        "digits leaked into the output: {code:?}"
    );
}

/// `read_sequence` decodes with the attribute rule, so the legacy set is off
/// inside a `<textarea>` — the host axis is the whole finding.
#[test]
fn textarea_does_not_apply_the_semicolonless_legacy_set() {
    for markup in ["<textarea>&notit</textarea>", "<textarea>&not=x</textarea>"] {
        let code = server(markup);
        assert!(
            code.contains("&amp;not"),
            "{markup}: expected the ampersand to stay literal, got {code}"
        );
        assert!(!code.contains('\u{AC}'), "{markup}: decoded, got {code}");
    }
}

/// The same text in a text node still decodes — otherwise the fix would be
/// "stop applying the legacy set", which is a different rule.
#[test]
fn markup_text_still_applies_the_legacy_set() {
    assert!(server("<p>&notit</p>").contains('\u{AC}'));
    assert!(server("<title>&notit</title>").contains('\u{AC}'));
    // A bare `&not` inside a textarea has no word character after it, so the
    // attribute rule decodes it there too.
    assert!(server("<textarea>&not</textarea>").contains('\u{AC}'));
}
