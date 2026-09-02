//! Upstream visits a `:global { … }` block's body with the same `Rule` / `Atrule`
//! visitors as any other block (`3-transform/css/index.js`), so the body's
//! children get the empty check, the unused check and the nested-`:global {}`
//! recursion; only the scoping is skipped. rsvelte copied each child VERBATIM in
//! non-minify mode, applying deletion ranges only — which can express
//! `remove_global_pseudo_class` (a deletion) and cannot express `/* (empty) … */`
//! (an insertion), so a nested empty rule was never commented out.
//!
//! The `-global-` keyframes rows are the regression half: they were green before
//! this change too, and they cover the work the deleted verbatim path did through
//! `collect_global_keyframe_prefixes`. A grid assembled only from the cells a
//! defect breaks has no cell left to regress.
//!
//! Every expectation is the official compiler's own output for the same source,
//! with the scope hash replaced by `HASH`.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn css(style: &str) -> String {
    let source = format!("<b class=\"x\">y</b>\n<style>\n\t{style}\n</style>\n");
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
    .unwrap_or_else(|err| panic!("{style}: {err:?}"))
    .css
    .map(|c| c.code)
    .unwrap_or_default();
    let mut result = out;
    while let Some(start) = result.find("svelte-") {
        let len = result[start..]
            .char_indices()
            .find(|(i, c)| *i > 0 && !c.is_ascii_alphanumeric() && *c != '-')
            .map_or(result.len() - start, |(i, _)| i);
        result.replace_range(start..start + len, "HASH");
    }
    result
}

/// The defect: a lone `:global { … }` whose child rule is empty. The descendant
/// row is the control — it already reached the ordinary `Rule` path and answered
/// correctly, which is why only the lone position diverged.
#[test]
fn an_empty_rule_inside_a_global_block_is_commented_out() {
    assert_eq!(
        css(":global {\n\t\t.g { &:disabled { } }\n\t}"),
        "\n\t/* :global {*/\n\t\t/* (empty) .g { &:disabled { } }*/\n\t/*}*/\n"
    );
    assert_eq!(
        css(".x :global {\n\t\t.g { &:disabled { } }\n\t}"),
        "\n\t.x.HASH {\n\t\t/* (empty) .g { &:disabled { } }*/\n\t}\n"
    );
}

/// With a declaration beside it the intermediate rule is non-empty on its own, so
/// the verdict lands one level deeper. This is the shape that hid the defect.
#[test]
fn the_empty_verdict_lands_on_the_child_that_is_empty() {
    assert_eq!(
        css(":global {\n\t\t.g { height: 20px; &:disabled { } }\n\t}"),
        "\n\t/* :global {*/\n\t\t.g { height: 20px; /* (empty) &:disabled { }*/ }\n\t/*}*/\n"
    );
}

/// The deleted verbatim path stripped a `-global-` keyframes prefix with a byte
/// range of its own. Both of these were green before the change; they are here to
/// say the `Atrule` visitor still does that work, at the top of the body and
/// nested inside an `@media`.
#[test]
fn a_global_keyframes_prefix_is_still_stripped_inside_a_global_block() {
    assert_eq!(
        css(
            ":global {\n\t\t.g { animation: -global-kf 1s; }\n\t\t@keyframes -global-kf { from { opacity: 0; } }\n\t}"
        ),
        "\n\t/* :global {*/\n\t\t.g { animation: -global-kf 1s; }\n\t\t@keyframes kf { from { opacity: 0; } }\n\t/*}*/\n"
    );
    assert_eq!(
        css(
            ":global {\n\t\t@media (min-width: 1px) { @keyframes -global-kf { from { opacity: 0; } } }\n\t\t.g { animation: -global-kf 1s; }\n\t}"
        ),
        "\n\t/* :global {*/\n\t\t@media (min-width: 1px) { @keyframes kf { from { opacity: 0; } } }\n\t\t.g { animation: -global-kf 1s; }\n\t/*}*/\n"
    );
}

/// The other thing the verbatim path did: a nested `:global(...)` still loses its
/// wrapper. Green before and after, and red under a version that routes the body
/// through a visitor without the bare-global flag.
#[test]
fn a_nested_global_argument_still_loses_its_wrapper() {
    assert_eq!(
        css(":global {\n\t\t.g { & :global(i) { color: green; } }\n\t}"),
        "\n\t/* :global {*/\n\t\t.g { & i { color: green; } }\n\t/*}*/\n"
    );
}
