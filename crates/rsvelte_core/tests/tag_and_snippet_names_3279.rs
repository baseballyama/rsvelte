//! Two name scanners were narrower than upstream's (#3279): the element-name
//! check accepted only `[a-z0-9-]` after the leading hyphen where upstream
//! implements the HTML `PotentialCustomElementName` production, and
//! `read_identifier` accepted only `char::is_alphanumeric` where upstream uses
//! acorn's `ID_Continue`.
//!
//! Removing those two over-rejections makes non-ASCII element names reachable
//! for the first time, which exposed three further divergences behind them:
//! a span whose end was computed from the *generated* identifier's byte length
//! (a panic once the source name is non-ASCII), an ASCII-only guard around the
//! `toLowerCase` of an HTML tag name, and an identifier sanitizer that counted
//! characters where upstream's regex counts UTF-16 code units.
//!
//! Every expectation here is the official compiler's output for the same source.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn go(src: &str, mode: GenerateMode) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: mode,
            dev: false,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

fn client(src: &str) -> String {
    go(src, GenerateMode::Client)
}

#[test]
fn pcen_continuation_characters_are_accepted() {
    // `_`, `.` and U+00B7 are plain `PCENChar`s; the hyphen group may be empty.
    for src in [
        "<x-a_b />",
        "<x-a.b />",
        "<x-\u{b7} />",
        "<x- />",
        "<foo- />",
        "<x-- />",
        "<my-café>y</my-café>",
    ] {
        for mode in [GenerateMode::Client, GenerateMode::Server] {
            let out = go(src, mode);
            assert!(!out.contains("COMPILE_ERROR"), "{src} ({mode:?}): {out}");
        }
    }
}

#[test]
fn non_pcen_names_are_still_rejected() {
    // A non-ASCII character before the first hyphen, and a leading hyphen, are
    // outside the production in both compilers.
    for src in ["<xü />", "<-x-foo />", "<1foo />"] {
        assert!(
            client(src).contains("COMPILE_ERROR"),
            "{src} should be rejected"
        );
    }
}

#[test]
fn namespaced_name_needs_two_characters_after_the_colon() {
    // `[a-zA-Z][a-zA-Z0-9-]*[a-zA-Z0-9]` — an alphabetic head *and* an
    // alphanumeric last character, so a one-character tail does not match.
    assert!(client("<a:b />").contains("COMPILE_ERROR"));
    assert!(!client("<svg:rect />").contains("COMPILE_ERROR"));
}

#[test]
fn a_name_the_component_regex_rejects_is_a_regular_element() {
    // `-` is neither `ID_Continue` nor `.`, so `X-a` is an element upstream
    // even though it starts uppercase; emitting a component call would produce
    // `X-a(...)`, which is not JavaScript.
    let out = client("<X-a>y</X-a>");
    assert!(out.contains("$.from_html(`<x-a>y</x-a>`"), "{out}");
    assert!(out.contains("var X_a = root();"), "{out}");

    // Same for a dotted name whose head is not a valid identifier chain.
    let out = client("<x-a.b />");
    assert!(out.contains("$.from_html(`<x-a.b></x-a.b>`"), "{out}");
    assert!(out.contains("var x_a_b = root();"), "{out}");
}

#[test]
fn multibyte_element_names_do_not_panic_and_keep_the_source_span() {
    // The declarator's span end was `start + generated_name.len()`, which lands
    // mid-character for every one of these. Two-, three- and four-byte
    // characters and a combining mark are separate cases because the byte
    // length is what decides whether the offset happens to be a boundary.
    for (src, expected_id) in [
        ("<x-\u{e9} />", "x__"),
        ("<x-\u{3042} />", "x__"),
        ("<x-\u{1d54f} />", "x___"),
        ("<x-e\u{301} />", "x_e_"),
        ("<my-caf\u{e9}>y</my-caf\u{e9}>", "my_caf_"),
    ] {
        let out = client(src);
        assert!(!out.contains("COMPILE_ERROR"), "{src}: {out}");
        assert!(
            out.contains(&format!("var {expected_id} = root();")),
            "{src}: expected `{expected_id}`\n{out}"
        );
    }
}

#[test]
fn html_tag_names_lowercase_beyond_ascii() {
    let out = client("<x-aⰀb />");
    assert!(out.contains("$.from_html(`<x-aⰰb></x-aⰰb>`"), "{out}");
}

#[test]
fn snippet_names_accept_every_id_continue_character() {
    // A combining mark and ZWNJ / ZWJ are `ID_Continue` in ECMAScript.
    for (src, name) in [
        (
            "{#snippet s\u{301}()}x{/snippet}{@render s\u{301}()}",
            "s\u{301}",
        ),
        (
            "{#snippet a\u{200c}b()}x{/snippet}{@render a\u{200c}b()}",
            "a\u{200c}b",
        ),
        (
            "{#snippet a\u{200d}b()}x{/snippet}{@render a\u{200d}b()}",
            "a\u{200d}b",
        ),
    ] {
        let out = client(src);
        assert!(!out.contains("COMPILE_ERROR"), "{src}: {out}");
        assert!(out.contains(&format!("const {name} = ($$anchor)")), "{out}");
    }
}

#[test]
fn a_snippet_name_that_is_not_an_identifier_start_is_expected_identifier() {
    let out = client("{#snippet 1a()}x{/snippet}");
    assert!(out.contains("expected_identifier"), "{out}");
}
