//! An unquoted attribute value ends at `/>`, whitespace, `"`, `'`, `` ` ``,
//! `<`, `=` or `>` — upstream's `regex_invalid_unquoted_attribute_value`
//! (issue #3332). rsvelte read one run of characters up to whitespace or `>`,
//! so it swallowed the rest of the start tag: `<div data-x=a<b>` became a
//! single attribute valued `a<b` where official has `data-x="a"` plus an
//! attribute named `<b`, and `<div data-x=a=b>` compiled at all.
//!
//! Expectations here are the official compiler's, captured over the 15 × 5 grid
//! the issue reports; the whole grid runs against the live oracle in the
//! `unquoted-attribute` matrix family.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn options() -> CompileOptions {
    CompileOptions {
        filename: Some("Test.svelte".to_string()),
        generate: GenerateMode::Client,
        dev: false,
        css: CssMode::External,
        ..Default::default()
    }
}

fn compile_ok(markup: &str) -> String {
    compile(markup, options())
        .unwrap_or_else(|e| panic!("expected {markup:?} to compile, got {e:?}"))
        .js
        .code
}

fn compile_err(markup: &str) -> String {
    let err = compile(markup, options())
        .err()
        .unwrap_or_else(|| panic!("expected {markup:?} to be rejected"));
    format!("{err:?}")
}

/// `<` ends the value; what follows is read as another attribute's name.
#[test]
fn lt_ends_the_value_and_starts_an_attribute_name() {
    let code = compile_ok("<div data-x=a<b></div>");
    assert!(
        code.contains(r#"<div data-x="a" <b=""></div>"#),
        "expected two attributes, got: {code}"
    );
}

/// A backtick is in the same terminator class as `<`, and nothing else in the
/// start tag is malformed — so this is the row that shows the value alone moved.
#[test]
fn backtick_ends_the_value() {
    let code = compile_ok("<div data-x=a`b></div>");
    // The template literal escapes the backtick, exactly as official does.
    assert!(
        code.contains(r#"<div data-x="a" \`b=""></div>"#),
        "expected the backtick to end the value, got: {code}"
    );
}

/// A component's attribute set is the prop object, where the split is plainest.
#[test]
fn component_attribute_set_splits_on_lt() {
    let code = compile_ok(
        "<script>\n\timport Comp from './Comp.svelte';\n</script>\n\n<Comp data-x=a<b />",
    );
    assert!(
        code.contains("'data-x': 'a'") && code.contains("'<b': true"),
        "expected two props, got: {code}"
    );
}

/// `=`, `"` and `'` end the value too, and each leaves a start tag official
/// rejects — the over-acceptance half of #3332, which no collected corpus can
/// hold because published code compiles.
#[test]
fn eq_and_quotes_are_rejected_like_upstream() {
    for markup in [
        "<div data-x=a=b></div>",
        "<div data-x=a\"b></div>",
        "<div data-x=a'b></div>",
    ] {
        let err = compile_err(markup);
        assert!(
            err.contains("expected_token"),
            "{markup}: expected expected_token, got {err}"
        );
    }
}

/// `a</b` — the `<` ends the value, upstream reads `<` as the next attribute's
/// name (`regex_token_ending_character` does not list `<`), and the missing `>`
/// is reported past that name rather than at the `<`.
#[test]
fn lt_slash_reports_past_the_consumed_name() {
    let err = compile_err("<div data-x=a</b></div>");
    assert!(err.contains("expected_token"), "got {err}");
    assert!(
        err.contains("span: (15,"),
        "expected the point to sit past the `<` upstream consumed, got {err}"
    );
}

/// `<!--` and `<![CDATA[` become attribute names official rejects by name.
#[test]
fn html_comment_and_cdata_openers_become_invalid_attribute_names() {
    for markup in [
        "<div data-x=a<!--b></div>",
        "<div data-x=a<![CDATA[x]]>b></div>",
    ] {
        let err = compile_err(markup);
        assert!(
            err.contains("attribute_invalid_name"),
            "{markup}: expected attribute_invalid_name, got {err}"
        );
    }
}

/// The controls: `>` already ended the value, `&` and an entity already
/// decoded, and a trailing `/` was already handled. A fix that simply ends the
/// value earlier and everywhere breaks these.
#[test]
fn controls_are_unchanged() {
    let code = compile_ok("<div data-x=abc></div>");
    assert!(code.contains(r#"data-x="abc""#), "{code}");

    let code = compile_ok("<div data-x=a&b></div>");
    assert!(code.contains(r#"data-x="a&amp;b""#), "{code}");

    let code = compile_ok("<div data-x=&amp;></div>");
    assert!(code.contains(r#"data-x="&amp;""#), "{code}");

    // A lone `/` stays in the value; only `/>` ends it.
    let code = compile_ok("<div data-x=a/b></div>");
    assert!(code.contains(r#"data-x="a/b""#), "{code}");

    let code = compile_ok("<input data-x=abc/>");
    assert!(code.contains(r#"data-x="abc""#), "{code}");

    // `>` ends the value AND the tag.
    let code = compile_ok("<div data-x=a>b</div>");
    assert!(code.contains(r#"<div data-x="a">b</div>"#), "{code}");
}

/// A top-level `<script>`/`<style>` attribute is read by
/// `read_static_attribute`, whose `regex_attribute_value` stops only at `>` and
/// whitespace — so the wider terminator set must NOT apply there.
#[test]
fn top_level_script_attribute_keeps_the_static_terminator_set() {
    let code = compile_ok("<script lang=ts>\n\tlet a: number = 1;\n\tconsole.log(a);\n</script>\n");
    assert!(code.contains("console.log"), "{code}");

    // `=` inside a top-level style attribute value stays part of the value
    // rather than ending it, so the element still closes.
    let code = compile_ok("<style a=b=c>\n\tp {\n\t\tcolor: red;\n\t}\n</style>\n<p>x</p>");
    assert!(code.contains(">x</p>"), "{code}");
}
