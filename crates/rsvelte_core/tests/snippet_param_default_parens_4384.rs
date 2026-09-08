//! A snippet parameter keeps the parentheses the source wrote (#4384).
//!
//! Upstream parses every template expression with `preserveParens: true` and
//! then calls `remove_parens` — except the snippet parameter list, which
//! `1-parse/state/tag.js` reads with `parse_expression_at` alone. The
//! `ParenthesizedExpression` nodes therefore survive into `node.parameters`,
//! which upstream spreads verbatim into the emitted function, so esrap prints
//! one pair per node AND `is_simple_expression` — which has no arm for a paren
//! node — takes the lazy `$.fallback` arm for a default however simple its
//! contents are. rsvelte unwraps every paren at conversion, so both halves have
//! to be recovered from the parameter's own source span.
//!
//! Every expected line is `svelte.compile`'s own output at `VERSION` 5.57.0,
//! read out of the pinned submodule — not written by hand.
//!
//! The same surviving node is read a second time, in phase 2: upstream's
//! `is_safe_identifier` walks a member chain by `node.object` and stops at a
//! paren, so a paren on the OBJECT (`(obj.a).b`) also sets
//! `analysis.needs_context` and the component gains `$.push`/`$.init`/`$.pop`.
//! That half is whole-file output and lives in the pattern corpus; the table
//! here compares one line.

use rsvelte_core::compiler::CompileOptions;
use rsvelte_core::{GenerateMode, compile};

/// `(parameter list, official client line, official server line)`.
#[rustfmt::skip]
const CELLS: &[(&str, &str, &str)] = &[
    ("p = obj.a", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => obj.a, true));", "function s($$renderer, p = obj.a) {"),
    ("p = 1", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), 1));", "function s($$renderer, p = 1) {"),
    ("p = -1", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => -1, true));", "function s($$renderer, p = -1) {"),
    ("p = obj.a ? (obj.a ? 1 : 2) : 3", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => obj.a ? (obj.a ? 1 : 2) : 3, true));", "function s($$renderer, p = obj.a ? (obj.a ? 1 : 2) : 3) {"),
    ("p = (obj.a, obj.a)", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => ((obj.a, obj.a)), true));", "function s($$renderer, p = ((obj.a, obj.a))) {"),
    ("p = (obj.a)", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => (obj.a), true));", "function s($$renderer, p = (obj.a)) {"),
    ("p = ((obj.a))", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => ((obj.a)), true));", "function s($$renderer, p = ((obj.a))) {"),
    ("p = (1)", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => (1), true));", "function s($$renderer, p = (1)) {"),
    ("p = (() => 1)", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => (() => 1), true));", "function s($$renderer, p = (() => 1)) {"),
    ("p = (a ? 1 : 2)", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => (a ? 1 : 2), true));", "function s($$renderer, p = (a ? 1 : 2)) {"),
    ("p = a ?? (b || c)", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => a ?? (b || c), true));", "function s($$renderer, p = a ?? (b || c)) {"),
    ("p = (a, b, c)", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => ((a, b, c)), true));", "function s($$renderer, p = ((a, b, c))) {"),
    ("p = obj.a ? 1 : 2", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => obj.a ? 1 : 2, true));", "function s($$renderer, p = obj.a ? 1 : 2) {"),
    ("p = [1, (2, 3)]", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => [1, ((2, 3))], true));", "function s($$renderer, p = [1, ((2, 3))]) {"),
    ("p = { k: (1, 2) }", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => ({ k: ((1, 2)) }), true));", "function s($$renderer, p = { k: ((1, 2)) }) {"),
    ("p = (a = 1)", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => ($.set(a, 1)), true));", "function s($$renderer, p = (a = 1)) {"),
    ("p = (obj.a).b", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => (obj.a).b, true));", "function s($$renderer, p = (obj.a).b) {"),
    ("p = (x) => (y)", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), (x) => (y)));", "function s($$renderer, p = (x) => (y)) {"),
    ("p = typeof (a)", "let p = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => typeof (a), true));", "function s($$renderer, p = typeof (a)) {"),
    ("p = (await 0)", "ERROR:js_parse_error", "ERROR:js_parse_error"),
];

fn source(params: &str) -> String {
    format!(
        "<script>\n\tlet obj = {{ a: 1 }};\n\tlet a = 1, b = 2, c = 3, x = 4, y = 5;\n</script>\n\n{{#snippet s({params})}}\n\t{{p}}\n{{/snippet}}\n\n{{@render s()}}\n"
    )
}

/// Both compilers reject some cells, so a rejection is an answer rather than a
/// harness failure: it is compared as `ERROR:<code>` on both sides.
fn line(params: &str, generate: GenerateMode, needle: &str) -> String {
    let output = match compile(
        &source(params),
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate,
            dev: false,
            ..Default::default()
        },
    ) {
        Ok(output) => output,
        Err(error) => {
            let code = error.diagnostic().code.unwrap_or_default();
            return format!("ERROR:{code}");
        }
    };
    output
        .js
        .code
        .lines()
        .find(|line| line.contains(needle))
        .unwrap_or_else(|| panic!("{params:?}: no line containing {needle:?}"))
        .trim()
        .to_string()
}

#[test]
fn the_client_matches_the_official_compiler() {
    for (params, expected, _) in CELLS {
        assert_eq!(
            &line(params, GenerateMode::Client, "$.fallback("),
            expected,
            "client, {params:?}"
        );
    }
}

#[test]
fn the_server_matches_the_official_compiler() {
    for (params, _, expected) in CELLS {
        assert_eq!(
            &line(params, GenerateMode::Server, "function s("),
            expected,
            "server, {params:?}"
        );
    }
}

/// The table is only evidence about parentheses if it holds cells that carry
/// none: a build that bracketed everything, and one that bracketed nothing,
/// must each fail. It also has to hold both `$.fallback` arms, because the paren
/// decides which one upstream takes.
#[test]
fn the_table_carries_both_directions() {
    let (mut bracketed, mut bare) = (0usize, 0usize);
    let (mut lazy, mut eager, mut rejected) = (0usize, 0usize, 0usize);
    for (params, client, server) in CELLS {
        if params.contains('(') {
            bracketed += 1;
        } else {
            bare += 1;
        }
        if client.starts_with("ERROR:") {
            assert!(server.starts_with("ERROR:"), "one-sided reject: {params:?}");
            rejected += 1;
        } else if client.contains(", true)") {
            lazy += 1;
        } else {
            eager += 1;
        }
        assert!(!server.is_empty());
    }
    assert!(bracketed >= 12, "only {bracketed} parenthesized cells");
    assert!(bare >= 4, "only {bare} cells with no parentheses at all");
    assert!(lazy >= 4 && eager >= 2, "arms: {lazy} lazy, {eager} eager");
    assert!(rejected >= 1, "no cell both compilers reject");
}

/// The pairs are counted per node, so a doubled source pair prints doubled and
/// a sequence's own brackets sit inside the source's.
#[test]
fn nesting_is_counted_rather_than_flagged() {
    assert_eq!(
        line("p = ((obj.a))", GenerateMode::Server, "function s("),
        "function s($$renderer, p = ((obj.a))) {"
    );
    assert_eq!(
        line("p = (obj.a, obj.a)", GenerateMode::Server, "function s("),
        "function s($$renderer, p = ((obj.a, obj.a))) {"
    );
}
