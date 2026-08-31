//! Upstream walks a compound from the END and stops at the first selector that
//! is not a pseudo (`3-transform/css/index.js:344-368`); only the selector it
//! stops on is rewritten, and a bare `*` there is REPLACED by the modifier
//! while anything else gets it appended. rsvelte replaced every bare `*`, so
//! `*.a` emitted the modifier twice — once for the `*` and once after `.a`,
//! the second one as `:where(...)` because the first had set `bumped`.
//!
//! Every expectation is the official compiler's own output (5.56.10).

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

/// The stylesheet with the component hash replaced by `HASH`.
fn scoped(body: &str) -> String {
    let source = format!("<p class=\"a card wide\" data-k=\"v\">x</p>\n<style>{body}</style>\n");
    let out = compile(
        &source,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .unwrap_or_else(|err| panic!("{body}: {err:?}"))
    .css
    .map(|c| c.code)
    .unwrap_or_default();
    let Some(start) = out.find("svelte-") else {
        return out.trim().to_string();
    };
    let len = out[start..]
        .char_indices()
        .find(|(i, c)| *i > 0 && !c.is_ascii_alphanumeric() && *c != '-')
        .map_or(out.len() - start, |(i, _)| i);
    out.replace(&out[start..start + len], "HASH")
        .trim()
        .to_string()
}

#[test]
fn a_universal_before_the_stopping_selector_stays_in_the_output() {
    for (body, expected) in [
        ("*.a { color: red }", "*.a.HASH { color: red }"),
        (
            "*.card.wide { color: green }",
            "*.card.wide.HASH { color: green }",
        ),
        (
            "*[data-k] { color: blue }",
            "*[data-k].HASH { color: blue }",
        ),
        // A trailing pseudo does not move where the walk stops.
        (
            "*.a:hover { color: teal }",
            "*.a.HASH:hover { color: teal }",
        ),
    ] {
        assert_eq!(scoped(body), expected, "{body}");
    }
}

#[test]
fn a_universal_that_is_the_stopping_selector_is_replaced() {
    // The control: here the `*` IS what the backward walk stops on, so upstream
    // overwrites it — which is why "keep the `*`" cannot be the whole rule.
    for (body, expected) in [
        ("* { color: red }", ".HASH { color: red }"),
        (
            "*:first-child { color: olive }",
            ".HASH:first-child { color: olive }",
        ),
    ] {
        assert_eq!(scoped(body), expected, "{body}");
    }
}
