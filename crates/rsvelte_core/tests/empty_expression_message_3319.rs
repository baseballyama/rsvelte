//! An expression body with no code in it reported `Empty parenthesized
//! expression` — OXC's message for `()`, which is the wrapper
//! `check_js_parse_error_with_pos` adds, not anything in the source (#3319).
//!
//! Upstream hands acorn the unwrapped text, so every one of these is
//! `js_parse_error` / `Unexpected token`. Code, message and both endpoints
//! below were measured against `svelte.compile`.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn error(src: &str) -> Option<(String, String, u32, u32)> {
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
        let (start, end) = d.span.unwrap_or((u32::MAX, u32::MAX));
        (
            d.code.unwrap_or_default(),
            d.message.lines().next().unwrap_or_default().to_string(),
            start,
            end,
        )
    })
}

fn assert_unexpected_token(src: &str, at: u32) {
    let actual = error(src).unwrap_or_else(|| panic!("must not compile: {src:?}"));
    assert_eq!(
        actual,
        (
            "js_parse_error".to_string(),
            "Unexpected token".to_string(),
            at,
            at
        ),
        "for {src:?}"
    );
}

/// The two tags #3319 reports, in the hosts that put the body at a different
/// offset.
#[test]
fn an_empty_html_or_attach_body_is_an_unexpected_token() {
    assert_unexpected_token("{@html }", 7);
    assert_unexpected_token("{@html  }", 8);
    assert_unexpected_token("<div>{@html }</div>", 12);
    assert_unexpected_token("<div {@attach }></div>", 14);
    assert_unexpected_token("<div {@attach  }></div>", 15);
}

/// The site is shared, so the same body is the same error in every slot that
/// reads an expression — which is why this is one fix and not two.
#[test]
fn every_expression_slot_agrees_on_an_empty_body() {
    assert_unexpected_token("{}", 1);
    assert_unexpected_token("<div>{}</div>", 6);
    assert_unexpected_token("<b a={}></b>", 6);
    // `{@render }` and the `{#await}` head are deliberately absent: on this
    // branch both still swallow the parse error — `{@render }` reports
    // `render_tag_invalid_expression` and `{#await }x{/await}` compiles. That is
    // #3202 / PR #3504. Once it lands they join this list (`{@render }` at 9,
    // `{@render  }` at 10, `{#await }` at 8, `{#await  }` at 9), with the
    // message this PR supplies.
    assert_unexpected_token("{#if }x{/if}", 5);
    assert_unexpected_token("{#if  }x{/if}", 6);
    assert_unexpected_token("{#key }x{/key}", 6);
    assert_unexpected_token("{#key  }x{/key}", 7);
}

/// Whitespace is not only the space character, and a body that is *only* a
/// comment carries no code either — the reason this asks the parser rather than
/// testing `trim().is_empty()`.
#[test]
fn whitespace_and_comment_only_bodies_are_the_same_verdict() {
    assert_unexpected_token("{   }", 4);
    assert_unexpected_token("{\n}", 2);
    assert_unexpected_token("{\t}", 2);
    assert_unexpected_token("{\u{a0}}", 3);
    assert_unexpected_token("{/* c */}", 8);
}

/// A body that does carry code keeps the JS parser's own message: the remap
/// must not swallow a real diagnostic.
#[test]
fn a_body_with_code_in_it_keeps_its_own_message() {
    for (src, message) in [
        ("{1 +}", "Unexpected token"),
        ("{f(}", "Expected `)` but found `EOF`"),
        ("{42 = nope}", "Assigning to rvalue"),
        ("{'a' /* c */ 'b'}", "Expected token }"),
    ] {
        let actual = error(src).unwrap_or_else(|| panic!("must not compile: {src:?}"));
        assert_eq!(actual.1, message, "for {src:?}");
    }
}

#[test]
fn valid_expressions_still_compile() {
    for src in [
        "{1}",
        "{/* c */ 1}",
        "{'/*'}",
        "<b a={1}></b>",
        "{@html s}",
        "{#if a}x{/if}",
    ] {
        assert_eq!(error(src), None, "must compile: {src:?}");
    }
}
