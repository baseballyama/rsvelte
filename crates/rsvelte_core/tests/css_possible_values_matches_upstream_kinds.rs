//! `gather_possible_values` (`2-analyze/css/utils.js:11-78`) evaluates exactly
//! five node kinds — `Literal`, `ConditionalExpression`, `LogicalExpression`,
//! and for a class attribute `ArrayExpression` / `ObjectExpression`. Everything
//! else falls to its `else` and marks the value UNKNOWN, which makes the whole
//! attribute unmatchable and keeps every rule that could target it.
//!
//! rsvelte evaluated a `TemplateLiteral` with no interpolations, and (in one of
//! its two ports) a `BinaryExpression`, so `class={`a b`}` was read as the
//! static string `a b` and unrelated rules were pruned as `/* (unused) */`
//! where the official compiler keeps them.
//!
//! Every expectation is the official compiler's own output (5.56.10).

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn prunes_missing(markup: &str) -> bool {
    let source = format!("{markup}\n\n<style>\n\t.missing {{\n\t\tcolor: red;\n\t}}\n</style>\n");
    let css = compile(
        &source,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .unwrap_or_else(|err| panic!("{markup}: {err:?}"))
    .css
    .map(|c| c.code)
    .unwrap_or_default();
    css.contains("/* (unused) .missing {")
}

#[test]
fn a_kind_upstream_does_not_evaluate_keeps_the_rule() {
    for markup in [
        "<div class={`a b`}>x</div>",
        "<div class={`a ${1} b`}>x</div>",
        "<div class={\"a\" + \" b\"}>x</div>",
        "<script>let foo = \"a\";</script>\n\n<div class={foo}>x</div>",
    ] {
        assert!(!prunes_missing(markup), "should not prune: {markup}");
    }
}

#[test]
fn the_kinds_upstream_does_evaluate_still_prune() {
    // The controls. A string `Literal` and a plain static attribute are both
    // evaluated upstream, so the unrelated rule is still pruned — "stop
    // evaluating template literals" must not turn into "stop evaluating".
    for markup in ["<div class={\"a b\"}>x</div>", "<div class=\"a b\">x</div>"] {
        assert!(prunes_missing(markup), "should prune: {markup}");
    }
}
