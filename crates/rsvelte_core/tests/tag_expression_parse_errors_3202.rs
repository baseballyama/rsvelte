//! `{@const}`, the `{#await}` head and `{@render}` swallowed every JS parse
//! error: all three route their expression through a parse whose contract is
//! `.unwrap_or_else(|_| create_empty_identifier(…))`, so ordinary broken
//! JavaScript compiled (issue #3202).
//!
//! Upstream's `read_expression` throws unless `parser.loose`, and the caller
//! then does `allow_whitespace(); eat('}', true)` — which is why a *complete*
//! expression with leftover input after it is an `expected_token` while a
//! malformed one is a `js_parse_error`. Both classifications are asserted
//! below, and every code, message and byte offset was measured against
//! `svelte.compile`.
//!
//! `{@render}` is the row that shows the shape: the swallowed expression became
//! an empty identifier, which is not a call, so the *downstream* validation
//! fired with a different code standing in for the error that was dropped.

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

const UNEXPECTED: &str = "Unexpected token";
const RVALUE: &str = "Assigning to rvalue";
const EXPECTED_BRACE: &str = "Expected token }";

#[test]
fn a_const_tag_initializer_reports_its_parse_error() {
    assert_error(
        "{#if true}{@const c = 1 +}<b>{c}</b>{/if}",
        "js_parse_error",
        UNEXPECTED,
        25,
    );
    assert_error(
        "{#if true}{@const c = 42 = nope}<b>{c}</b>{/if}",
        "js_parse_error",
        RVALUE,
        22,
    );
}

#[test]
fn an_await_head_reports_its_parse_error() {
    for src in [
        "{#await 42 = nope}<b>x</b>{/await}",
        "{#await 42 = nope then v}<b>{v}</b>{/await}",
        "{#await 42 = nope catch e}<b>{e}</b>{/await}",
    ] {
        assert_error(src, "js_parse_error", RVALUE, 8);
    }
    assert_error(
        "{#await 1 +}<b>x</b>{/await}",
        "js_parse_error",
        UNEXPECTED,
        11,
    );
}

#[test]
fn a_render_tag_reports_its_parse_error() {
    assert_error("{@render s(42 = nope)}", "js_parse_error", RVALUE, 11);
    assert_error("{@render 1 +}", "js_parse_error", UNEXPECTED, 12);
}

/// The residual: rsvelte's `js_parse_error` MESSAGE and offset come from OXC,
/// which labels some failures a token away from acorn and spells a truncated
/// input `Expected `)` but found `EOF`` where acorn says `Unexpected token`.
/// That is one pre-existing property of `check_js_parse_error_with_pos`, shared
/// with the mustache path this issue does not touch — measured on `{f(}`
/// (official 3, rsvelte 3, message diverges) and `{s(1 +)}` (official 6,
/// rsvelte 7). So the three tag entry points must now answer *identically to a
/// mustache carrying the same expression*: whatever that residual is, it is not
/// a property of the tag.
#[test]
fn a_tag_classifies_exactly_as_a_mustache_carrying_the_same_expression() {
    // (source, byte offset at which the expression starts). An `{#await}` head
    // is absent from the unbalanced-`(` group on purpose: nothing terminates it,
    // so that shape is `block_unclosed` — issue #3247, not this one.
    let groups: [&[(&str, u32)]; 2] = [
        &[
            ("{f(}", 1),
            ("{@render f(}", 9),
            ("{#if true}{@const c = f(}<b>{c}</b>{/if}", 22),
        ],
        &[
            ("{s(1 +)}", 1),
            ("{@render s(1 +)}", 9),
            ("{#await s(1 +)}x{/await}", 8),
            ("{#if true}{@const c = s(1 +)}<b>{c}</b>{/if}", 22),
        ],
    ];
    let relative = |&(src, base): &(&str, u32)| {
        let (code, message, at) = error(src).unwrap_or_else(|| panic!("must not compile: {src:?}"));
        (code, message, at - base)
    };
    for group in groups {
        let expected = relative(&group[0]);
        for row in &group[1..] {
            assert_eq!(relative(row), expected, "for {:?}", row.0);
        }
    }
}

/// Upstream reads ONE expression and then expects the `}`, so leftover input
/// after a complete expression is a missing token rather than a JS error — the
/// two halves of `read_expression`'s contract, and the reason a fix that maps
/// every failure to `js_parse_error` is wrong.
#[test]
fn leftover_input_after_a_complete_expression_is_a_missing_brace() {
    assert_error(
        "{#if true}{@const c = 1 2}<b>{c}</b>{/if}",
        "expected_token",
        EXPECTED_BRACE,
        24,
    );
    assert_error(
        "{#if true}{@const c = 1;}<b>{c}</b>{/if}",
        "expected_token",
        EXPECTED_BRACE,
        23,
    );
    assert_error(
        "{#await a b}<b>x</b>{/await}",
        "expected_token",
        EXPECTED_BRACE,
        10,
    );
    assert_error(
        "{#await a b then v}<b>{v}</b>{/await}",
        "expected_token",
        EXPECTED_BRACE,
        10,
    );
    assert_error("{@render s() x}", "expected_token", EXPECTED_BRACE, 13);
    assert_error("{@render s();}", "expected_token", EXPECTED_BRACE, 12);
}

/// A render tag whose expression PARSES but is not a call keeps its own
/// analysis-phase code: the parse error and the invalid-expression error are
/// two different verdicts and the fix must not collapse them.
#[test]
fn a_render_tag_that_parses_still_reaches_the_call_check() {
    assert_error(
        "{@render 1}",
        "render_tag_invalid_expression",
        "`{@render ...}` tags can only contain call expressions",
        9,
    );
}

#[test]
fn valid_tags_still_compile() {
    for src in [
        "{@render s(1)}",
        "{@render s?.()}",
        "{#await p then v}<b>{v}</b>{/await}",
        "{#await p}<b>w</b>{:then v}<b>{v}</b>{:catch e}<b>{e}</b>{/await}",
        // `then` as part of the expression, not as the clause keyword.
        "{#await obj.then}<b>x</b>{/await}",
        "{#if true}{@const c = 1}<b>{c}</b>{/if}",
        "{#if true}{@const c = (a) => a}<b>{c(1)}</b>{/if}",
        // A parenthesised sequence is legal where a bare one is not.
        "{#if true}{@const c = (1, 2)}<b>{c}</b>{/if}",
    ] {
        assert_eq!(error(src), None, "must compile: {src:?}");
    }
}

/// The sequence-expression rejection reads the PARSED initializer, so it only
/// survives if the const tag keeps parsing eagerly rather than deferring.
///
/// Negative control (measured): route this through the deferring
/// `parse_head_expression` and every test here that carries a `{@const}` fails
/// — `node_type()` is `None` for a deferred expression, so the rejection is
/// skipped, and `expression_into_node` then panics because the declaration
/// builder takes ownership of the typed node.
#[test]
fn a_sequence_initializer_is_still_rejected() {
    assert_error(
        "{#if true}{@const a = 1, b = 2}<b>x</b>{/if}",
        "const_tag_invalid_expression",
        "{@const ...} must consist of a single variable declaration",
        22,
    );
}

/// A type annotation is not an expression in TypeScript either: acorn-typescript
/// returns the identifier and leaves the colon to the caller's `eat('}')`, so the
/// diagnostic is `expected_token`. rsvelte probes with a synthetic `(` wrapper,
/// where TypeScript *does* allow an annotation — it is an arrow parameter list —
/// so the probe read past the colon and reported the next real syntax error.
///
/// Both codes and both offsets are the official compiler's own output (5.56.10).
#[test]
fn a_type_annotation_in_a_mustache_is_a_missing_close_token() {
    // The same source with and without `lang="ts"`: the answer must not depend
    // on it, which is what makes the JavaScript row the control for the other.
    for (prefix, offset) in [
        ("<script lang=\"ts\">\n\tlet a = 1;\n</script>\n\n", 43u32),
        ("", 0),
    ] {
        for body in [
            "{\n\tdata: string;\n}\n",
            "{\n\t/** doc */\n\tdata: string;\n}\n",
        ] {
            let src = format!("{prefix}{body}");
            let colon = src.find(':').unwrap() as u32;
            assert!(colon > offset, "{src:?}");
            assert_error(&src, "expected_token", "Expected token }", colon);
        }
    }
}
