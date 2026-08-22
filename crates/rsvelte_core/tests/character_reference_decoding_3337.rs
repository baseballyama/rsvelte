//! Issue #3337 — the NUMERIC half of the character reference decoder. Every
//! expectation below was read off the official compiler (`submodules/svelte`,
//! `generate: 'server'`), not off rsvelte's own output.
//!
//! The lowercase `&#x`, Windows-1252, `&#0;` and astral rows are what make the
//! divergent rows a set rather than "numeric references are broken". #3337's
//! third part (the semicolon-less legacy set inside `<textarea>`) is #3205 and
//! lands in PR #3392; the named rows here are only its negative control.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn pushed(markup: &str) -> String {
    let out = compile(
        &format!("{markup}\n"),
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    out.lines()
        .find(|l| l.contains("$$renderer.push"))
        .unwrap_or_else(|| panic!("no push in:\n{out}"))
        .trim()
        .to_string()
}

fn check(cases: &[(&str, &str)]) {
    let mut wrong = Vec::new();
    for (markup, expected) in cases {
        let actual = pushed(markup);
        if actual != *expected {
            wrong.push(format!(
                "  {markup}\n    want {expected:?}\n    got  {actual:?}"
            ));
        }
    }
    assert!(wrong.is_empty(), "{}", wrong.join("\n"));
}

/// The `x` of a hexadecimal reference is lowercase-only in upstream's pattern
/// (`#(?:x[a-fA-F\d]+|\d+)(?:;)?`), so `&#X41;` is not a reference at all.
#[test]
fn uppercase_hex_marker_is_not_a_character_reference() {
    check(&[
        ("<p>&#X41;</p>", "$$renderer.push(`<p>&amp;#X41;</p>`);"),
        (
            "<p title=\"&#X41;\">y</p>",
            "$$renderer.push(`<p title=\"&amp;#X41;\">y</p>`);",
        ),
        (
            "<textarea>&#X41;</textarea>",
            "$$renderer.push(`<textarea>&amp;#X41;</textarea>`);",
        ),
        // control: the lowercase spelling still decodes everywhere
        ("<p>&#x41;</p>", "$$renderer.push(`<p>A</p>`);"),
        (
            "<textarea>&#x41;</textarea>",
            "$$renderer.push(`<textarea>A</textarea>`);",
        ),
    ]);
}

/// Upstream bails out (`if (!code) return match`) on a *parsed* value of 0, then
/// feeds everything else through `validate_code` — which folds a surrogate half
/// or an above-range value to NUL and emits `String.fromCodePoint(0)`. Neither
/// side follows HTML here (which substitutes U+FFFD); byte equality is the goal.
#[test]
fn surrogate_and_out_of_range_references_fold_to_nul() {
    check(&[
        ("<p>&#xD800;</p>", "$$renderer.push(`<p>\u{0}</p>`);"),
        ("<p>&#xDFFF;</p>", "$$renderer.push(`<p>\u{0}</p>`);"),
        ("<p>&#55296;</p>", "$$renderer.push(`<p>\u{0}</p>`);"),
        ("<p>&#x110000;</p>", "$$renderer.push(`<p>\u{0}</p>`);"),
        ("<p>&#x10FFFF;</p>", "$$renderer.push(`<p>\u{0}</p>`);"),
        ("<p>&#x30000;</p>", "$$renderer.push(`<p>\u{0}</p>`);"),
        // a value too large for `u32` — upstream keeps a float and still reaches NUL,
        // so the decoder must not truncate the digit run and decode the head
        (
            "<p>&#99999999999999999999;</p>",
            "$$renderer.push(`<p>\u{0}</p>`);",
        ),
        // controls that must not move
        ("<p>&#0;</p>", "$$renderer.push(`<p>&amp;#0;</p>`);"),
        ("<p>&#x80;</p>", "$$renderer.push(`<p>\u{20ac}</p>`);"),
        ("<p>&#xFFFE;</p>", "$$renderer.push(`<p>\u{fffe}</p>`);"),
        ("<p>&#x1F600;</p>", "$$renderer.push(`<p>\u{1f600}</p>`);"),
        ("<p>&#x1D11E;</p>", "$$renderer.push(`<p>\u{1d11e}</p>`);"),
    ]);
}

/// The named half of the decoder is #3205's territory (PR #3392); these rows are
/// here as the control that the numeric changes leave it alone.
#[test]
fn named_references_are_unaffected() {
    check(&[
        (
            "<p>a&notreal;b</p>",
            "$$renderer.push(`<p>a\u{ac}real;b</p>`);",
        ),
        ("<p>&notit</p>", "$$renderer.push(`<p>\u{ac}it</p>`);"),
        ("<p>a&not;b</p>", "$$renderer.push(`<p>a\u{ac}b</p>`);"),
        (
            "<p title=\"a&notreal;b\">y</p>",
            "$$renderer.push(`<p title=\"a&amp;notreal;b\">y</p>`);",
        ),
    ]);
}
