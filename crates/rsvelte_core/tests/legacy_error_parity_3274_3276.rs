//! Error-field parity for three legacy over-acceptances (#3274) and four
//! diverging error fields (#3276). Every expectation below was read off the
//! official compiler (`submodules/svelte`, `compile()` with the same source and
//! `generate`) — code, message, and both endpoints as `line:column`.

use rsvelte_core::compiler::{CssMode, source_span};
use rsvelte_core::{CompileOptions, GenerateMode, compile};

#[derive(Debug, PartialEq, Eq)]
struct Diagnostic {
    code: Option<String>,
    message: String,
    span: Option<(String, String)>,
}

fn compile_err(src: &str, generate: GenerateMode) -> Option<Diagnostic> {
    let err = compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .err()?;
    let diagnostic = err.diagnostic();
    let span = diagnostic.span.map(|span| {
        let resolved = source_span(src, span);
        (
            format!("{}:{}", resolved.start.line, resolved.start.column),
            format!("{}:{}", resolved.end.line, resolved.end.column),
        )
    });
    Some(Diagnostic {
        code: diagnostic.code,
        message: diagnostic.message,
        span,
    })
}

fn expect_err(src: &str) -> Diagnostic {
    let client = compile_err(src, GenerateMode::Client)
        .unwrap_or_else(|| panic!("client target accepted {src:?}"));
    let server = compile_err(src, GenerateMode::Server)
        .unwrap_or_else(|| panic!("server target accepted {src:?}"));
    assert_eq!(client, server, "targets disagree for {src:?}");
    client
}

fn assert_diagnostic(src: &str, code: &str, message: &str, start: &str, end: &str) {
    let actual = expect_err(src);
    assert_eq!(
        actual,
        Diagnostic {
            code: Some(code.to_string()),
            message: format!("{message}\nhttps://svelte.dev/e/{code}"),
            span: Some((start.to_string(), end.to_string())),
        },
        "for {src:?}"
    );
}

/// #3274.1 — an `on:` with no event name compiled. Upstream tests the name
/// *after* splitting modifiers off, and attributes the error to the run up to
/// and including the colon, so both spellings report the same range.
#[test]
fn svelte_component_this_must_be_an_expression() {
    for src in [
        "<svelte:component this=\"Child\" />",
        "<svelte:component this=\"\" />",
        "<svelte:component this=\"a{Child}\" />",
        "<svelte:component this />",
    ] {
        assert_diagnostic(
            src,
            "svelte_component_invalid_this",
            "Invalid component definition — must be an `{expression}`",
            "1:18",
            "1:18",
        );
    }

    for src in [
        "<svelte:component this={Child} />",
        "<svelte:component this=\"{Child}\" />",
    ] {
        assert!(
            compile_err(src, GenerateMode::Client).is_none(),
            "expected {src:?} to compile"
        );
    }
}

/// #3274.3 — `validate_tag` rejects anything that is not a string literal.
/// The empty string is the one falsy string it lets through.
#[test]
fn custom_element_tag_must_be_a_string_literal() {
    for src in [
        "<svelte:options customElement={{ tag: null }} />\n<div>x</div>",
        "<svelte:options customElement={{ tag: 1 }} />\n<div>x</div>",
        "<svelte:options customElement={{ tag: true }} />\n<div>x</div>",
        "<svelte:options customElement={{ tag: nope }} />\n<div>x</div>",
    ] {
        let actual = expect_err(src);
        assert_eq!(
            actual.code.as_deref(),
            Some("svelte_options_invalid_tagname"),
            "for {src:?}"
        );
    }

    for src in [
        "<svelte:options customElement={{ tag: '' }} />\n<div>x</div>",
        "<svelte:options customElement=\"\" />\n<div>x</div>",
        "<svelte:options customElement={{ tag: 'my-el' }} />\n<div>x</div>",
    ] {
        assert!(
            compile_err(src, GenerateMode::Client).is_none(),
            "expected {src:?} to compile"
        );
    }
}

/// #3276.1 — upstream raises `svelte_component_missing_this` from the parser
/// with the element's start offset alone, so the range is zero-width rather
/// than spanning the element.
#[test]
fn svelte_component_missing_this_reports_a_zero_width_range() {
    for (src, start) in [
        ("<svelte:component />", "1:0"),
        ("{#if x}<svelte:component />{/if}", "1:7"),
    ] {
        assert_diagnostic(
            src,
            "svelte_component_missing_this",
            "`<svelte:component>` must have a 'this' attribute",
            start,
            start,
        );
    }
}

/// #3276.2 — a defaulted shorthand inside a `let:` value is a JS parse error,
/// not a missing close brace. Upstream reports acorn's wording at the `=`; the
/// same expression in a mustache and in a plain attribute reports identically.
#[test]
fn shorthand_property_assignment_reports_acorns_error() {
    for (src, start) in [
        ("{{ a = 1 }}", "1:5"),
        ("<div title={{ a = 1 }}></div>", "1:16"),
        ("<Child let:v={{ a = 1 }}>{typeof a}</Child>", "1:18"),
    ] {
        assert_diagnostic(
            src,
            "js_parse_error",
            "Shorthand property assignments are valid only in destructuring patterns",
            start,
            start,
        );
    }
}

/// A genuine trailing token after a complete expression stays `expected_token`,
/// which is the classification the shorthand case above was borrowing.
#[test]
fn trailing_tokens_after_a_complete_expression_stay_expected_token() {
    let actual = expect_err("{#if a b}x{/if}");
    assert_eq!(actual.code.as_deref(), Some("expected_token"));
}

/// #3276.3 — upstream throws a bare `Error` here, so the message a consumer
/// reads must carry no Rust-side prefix.
#[test]
fn not_implemented_let_directive_has_no_prefix() {
    let actual = compile_err(
        "<svelte:element this={'div'} let:v>{typeof v}</svelte:element>",
        GenerateMode::Client,
    )
    .expect("a let: directive on <svelte:element> must not compile for the client");
    assert_eq!(
        actual,
        Diagnostic {
            code: None,
            message: "Not implemented: LetDirective".to_string(),
            span: None,
        }
    );
}

/// #3276.4 — the error was emitted without a position; upstream attributes it
/// to the `$:` statement.
#[test]
fn legacy_reactive_statement_in_runes_mode_carries_a_position() {
    for src in [
        "<svelte:options runes={true} />\n<script>\n\tlet c = 0;\n\t$: d = c + 1;\n</script>\n<p>{d}</p>",
        "<svelte:options runes />\n<script>\n\tlet c = 0;\n\t$: d = c + 1;\n</script>\n<p>{d}</p>",
    ] {
        assert_diagnostic(
            src,
            "legacy_reactive_statement_invalid",
            "`$:` is not allowed in runes mode, use `$derived` or `$effect` instead",
            "4:1",
            "4:14",
        );
    }
}
