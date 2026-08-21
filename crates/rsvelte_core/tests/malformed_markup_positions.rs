//! Malformed markup: the code and the (start, end) point upstream reports.
//!
//! Three shapes of divergence, all measured against the official compiler on
//! the same input:
//!
//! - a continuation / close reported at the `{` rather than at the `:` / `/`
//!   upstream's `next()` and `close()` pass (`parser.index - 1`);
//! - an unterminated region reported after the file's trailing whitespace,
//!   where upstream's template is `trimEnd()`-ed and so runs out one point
//!   earlier — sometimes under a different code;
//! - every `expected_token` spanning one column, where upstream passes a bare
//!   index and `errors.js`'s `e()` reads it for both endpoints.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn diagnostic(src: &str) -> Option<(Option<String>, Option<(u32, u32)>)> {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .err()
    .map(|e| {
        let d = e.diagnostic();
        (d.code, d.span)
    })
}

/// `(source, code, start)` — every position is the byte offset the official
/// compiler reports for the same input, and `end` equals `start` on all of
/// them because upstream hands `e()` a bare index at each of these sites.
const POINT_ERRORS: &[(&str, &str, u32)] = &[
    // A continuation or close is located at the marker character, not the `{`.
    ("{:else}<b>x</b>", "block_invalid_continuation_placement", 1),
    (
        "{:then v}<b>x</b>",
        "block_invalid_continuation_placement",
        1,
    ),
    ("{ :else}x", "block_invalid_continuation_placement", 2),
    ("{/if}", "block_unexpected_close", 1),
    ("{ /if}", "block_unexpected_close", 2),
    ("<div>{/if}</div>", "block_unexpected_close", 6),
    // `eat('>', true, false)` runs immediately after the optional `/`.
    ("<br / title=\"a\">", "expected_token", 5),
    ("<div/ >", "expected_token", 5),
    // A top-level `<script>` / `<style>` never consumes the `/`.
    ("<script foo=\"b\"/>", "expected_token", 15),
    // An unterminated region runs out where the right-trimmed template ends.
    ("<!-- c\n", "expected_token", 6),
    ("<div>\n<!-- c\n</div>\n", "expected_token", 19),
    ("<p>a</p>\n<style>b { color: red }\n", "expected_token", 32),
    ("<div title=\"a>x</div>\n", "unexpected_eof", 21),
    // `read_until` entered at the end of input vs running out inside the body.
    ("<script>let a = 1;\n", "element_unclosed", 18),
    ("<script>\n", "unexpected_eof", 8),
    // A closing tag demands its `>` before the name is compared.
    ("<div>x</div\n", "expected_token", 11),
    ("<span></span\n", "expected_token", 12),
    ("<div><span>x</span\n</div>\n", "expected_token", 19),
    // A mustache with no `}` anywhere demands one where the expression stopped.
    ("{@html z\n", "expected_token", 8),
    ("{@render f()\n", "expected_token", 12),
];

#[test]
fn malformed_markup_reports_upstreams_code_and_point() {
    for (src, code, start) in POINT_ERRORS {
        let Some((actual_code, span)) = diagnostic(src) else {
            panic!("{src:?} must not compile");
        };
        assert_eq!(
            actual_code.as_deref(),
            Some(*code),
            "wrong code for {src:?}"
        );
        assert_eq!(
            span,
            Some((*start, *start)),
            "wrong span for {src:?} (upstream reports [{start}, {start}])"
        );
    }
}

/// The other direction: shapes the official compiler accepts at the sites this
/// change now guards, so an over-rejection fails here rather than in a gate.
#[test]
fn well_formed_markup_still_compiles() {
    for src in [
        "<br />",
        "<br/>",
        "<div />",
        "<div></div>",
        "<div>{1}</div>",
        "<!-- c -->",
        "<div>\n<!-- c -->\n</div>",
        "<script>let a = 1;</script>",
        "<style>b { color: red }</style>",
        "<div><style>b { color: red }</style></div>",
        "<div><script>let a = 1;</script></div>",
        "<div title=\"a\">x</div>",
        "{#if 1}a{:else}b{/if}",
        "{#if 1}a{ :else }b{ /if }",
        "{#await p}a{:then v}b{/await}",
        "{@html x}",
        "{@render f()}",
        "<textarea>a</textarea>",
        "<div>a</div>\n\n",
    ] {
        assert!(
            diagnostic(src).is_none(),
            "{src:?} should compile: {:?}",
            diagnostic(src)
        );
    }
}
