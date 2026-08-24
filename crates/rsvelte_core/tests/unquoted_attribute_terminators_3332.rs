//! Issue #3332 — the terminator set of an unquoted attribute value.
//!
//! An unquoted value was read as one run up to whitespace, `>` or `/>`. The
//! HTML "attribute value (unquoted) state" — upstream's
//! `regex_invalid_unquoted_attribute_value`, `/(\/>|[\s"'=<>`])/y` — also ends
//! it on `"`, `'`, `=`, `<` and a backtick. Swallowing those produced a
//! different attribute *set* on inputs official splits, and accepted documents
//! official rejects.
//!
//! Every expectation was measured against the official compiler on the same
//! source. The controls are the value shapes that already agreed: `>`, `&`, an
//! entity, and a trailing `/` — so this is the terminator set, not unquoted
//! values in general.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn try_compile(source: &str) -> Result<String, String> {
    match compile(
        source,
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    ) {
        Ok(result) => Ok(result.js.code),
        Err(err) => Err(format!("{err:?}")),
    }
}

fn compile_ok(source: &str) -> String {
    try_compile(source).expect("compile failed")
}

#[test]
fn a_less_than_ends_the_value_and_starts_an_attribute() {
    let out = compile_ok("<div data-x=a<b></div>\n");
    // Official: `<div data-x="a" <b=""></div>`.
    assert!(
        out.contains(r#"<div data-x="a" <b=""></div>"#),
        "the `<` did not end the value:\n{out}"
    );
}

#[test]
fn a_backtick_ends_the_value_and_starts_an_attribute() {
    let out = compile_ok("<div data-x=a`b></div>\n");
    assert!(
        out.contains("<div data-x=\"a\" \\`b=\"\"></div>"),
        "the backtick did not end the value:\n{out}"
    );
}

#[test]
fn a_quote_or_equals_after_the_value_is_rejected() {
    // Official rejects all three with `expected_token` ("Expected token >").
    for source in [
        "<div data-x=a\"b></div>\n",
        "<div data-x=a'b></div>\n",
        "<div data-x=a=b></div>\n",
    ] {
        let err = try_compile(source).expect_err(&format!("{source:?} was accepted"));
        assert!(
            err.contains("expected_token"),
            "{source:?} produced the wrong error:\n{err}"
        );
    }
}

#[test]
fn a_missing_value_before_another_attribute_is_rejected() {
    // `<div data-x= id="i">`: official `expected_token` — the `=` of `id="i"`
    // ends the (empty) value, so the tag is not closed where one is demanded.
    let err = try_compile("<div data-x= id=\"i\"></div>\n").expect_err("was accepted");
    assert!(err.contains("expected_token"), "{err}");
}

/// The controls: the four value shapes that were already byte-identical.
#[test]
fn the_previously_matching_value_shapes_are_unchanged() {
    assert!(compile_ok("<div data-x=abc></div>\n").contains(r#"data-x="abc""#));
    assert!(compile_ok("<div data-x=a&b></div>\n").contains(r#"data-x="a&amp;b""#));
    assert!(compile_ok("<div data-x=&amp;></div>\n").contains(r#"data-x="&amp;""#));
    // A lone `/` is part of the value; only `/>` ends it.
    assert!(compile_ok("<input data-x=abc/>\n").contains(r#"data-x="abc""#));
}

/// A quoted value is untouched by the unquoted terminator set.
#[test]
fn a_quoted_value_still_holds_the_terminators() {
    let out = compile_ok("<div data-x=\"a<b=c`d\"></div>\n");
    assert!(
        out.contains(r"a&lt;b=c\`d"),
        "a quoted value lost its content:\n{out}"
    );
}
