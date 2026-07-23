//! Regression tests for issue #1703 — a nested rule whose inner selector uses
//! the parent-selector sibling combinator (`.a { & + & { … } }`, i.e. `.a + .a`)
//! was wrongly dropped as `/* (empty) */` even when a real adjacent pair of `.a`
//! elements existed.
//!
//! Root cause: the transform's sibling-combinator prune check
//! (`is_sibling_combinator_unused`) built a `SelectorInfo` for the `&`
//! (NestingSelector) via `extract_selector_info`, which ignores NestingSelector
//! and yields an empty (matches-nothing) info. The sibling walk then found no
//! element matching `&`, judged `& + &` unused, and the outer `.a` rule (which
//! has no declarations of its own) was dropped as empty. The fix resolves `&`
//! against the parent rule's subject compound (`.a`) before matching.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn css(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            runes: Some(true),
            ..Default::default()
        },
    )
    .expect("compile")
    .css
    .map(|c| c.code)
    .unwrap_or_default()
}

#[test]
fn nested_amp_plus_amp_literal_siblings_kept() {
    let out = css(
        "<div class=\"a\"></div><div class=\"a\"></div>\n<style>.a { & + & { color: red; } }</style>",
    );
    assert!(!out.contains("(empty)"), "rule must be kept, got:\n{out}");
    assert!(!out.contains("(unused)"), "rule must be kept, got:\n{out}");
    assert!(out.contains("& + &"), "expected `& + &` kept in:\n{out}");
    // The outer selector is scoped.
    assert!(
        out.contains(".a.svelte-"),
        "expected scoped `.a` in:\n{out}"
    );
}

#[test]
fn nested_amp_plus_amp_each_kept() {
    let out = css(
        "<script>let items = [1, 2];</script>\n{#each items as i}<p class=\"a\">{i}</p>{/each}\n\
         <style>.a { & + & { color: red; } }</style>",
    );
    assert!(!out.contains("(empty)"), "rule must be kept, got:\n{out}");
    assert!(!out.contains("(unused)"), "rule must be kept, got:\n{out}");
    assert!(out.contains("& + &"), "expected `& + &` kept in:\n{out}");
}

#[test]
fn nested_amp_tilde_amp_kept() {
    let out = css(
        "<div class=\"a\"></div><span></span><div class=\"a\"></div>\n<style>.a { & ~ & { color: red; } }</style>",
    );
    assert!(!out.contains("(empty)"), "rule must be kept, got:\n{out}");
    assert!(out.contains("& ~ &"), "expected `& ~ &` kept in:\n{out}");
}

#[test]
fn nested_amp_plus_amp_no_pair_pruned() {
    // Only a single `.a` — no adjacent pair exists, so `& + &` genuinely can't
    // match and the rule is dropped (matching the official compiler).
    let out = css("<div class=\"a\"></div>\n<style>.a { & + & { color: red; } }</style>");
    assert!(
        out.contains("(empty)") || out.contains("(unused)") || out.trim().is_empty(),
        "single `.a` should drop `& + &`, got:\n{out}"
    );
}

#[test]
fn nested_amp_plus_amp_multi_relative_parent_child_kept() {
    // Issue #1719: `.foo > .a { & + & }` where `.a` really is a child of `.foo`
    // and an adjacent pair exists. `&` resolves to the full `.foo > .a`; the
    // ancestor constraint is satisfied, so the official compiler keeps the outer
    // rule (`.foo.svelte-xxx > .a:where(.svelte-xxx) { & + & { … } }`). Previously
    // rsvelte only resolved single-relative parents and dropped this as `(empty)`.
    let out = css(
        "<div class=\"foo\"><div class=\"a\"></div><div class=\"a\"></div></div>\n\
         <style>.foo > .a { & + & { color: red; } }</style>",
    );
    assert!(!out.contains("(empty)"), "rule must be kept, got:\n{out}");
    assert!(!out.contains("(unused)"), "rule must be kept, got:\n{out}");
    assert!(out.contains("& + &"), "expected `& + &` kept in:\n{out}");
    assert!(
        out.contains(".foo.svelte-"),
        "expected scoped `.foo` in:\n{out}"
    );
}

#[test]
fn nested_amp_tilde_amp_multi_relative_parent_child_kept() {
    // Same fix for the general-sibling combinator inside a `>` parent chain.
    let out = css(
        "<div class=\"foo\"><div class=\"a\"></div><span></span><div class=\"a\"></div></div>\n\
         <style>.foo > .a { & ~ & { color: red; } }</style>",
    );
    assert!(!out.contains("(empty)"), "rule must be kept, got:\n{out}");
    assert!(!out.contains("(unused)"), "rule must be kept, got:\n{out}");
    assert!(out.contains("& ~ &"), "expected `& ~ &` kept in:\n{out}");
}

#[test]
fn nested_amp_plus_amp_multi_relative_parent_no_match_pruned() {
    // `.foo > .a { & + & }` where `.a` is not a child of `.foo`. `&` resolves to
    // the full `.foo > .a`, which this compound matcher can't verify, so it must
    // not over-keep: the outer rule is dropped as `(empty)`, matching upstream.
    let out = css(
        "<div class=\"foo\"></div><div class=\"a\"></div><div class=\"a\"></div>\n\
         <style>.foo > .a { & + & { color: red; } }</style>",
    );
    assert!(
        out.contains("(empty)"),
        "`.foo > .a` with non-child `.a` must drop `& + &` as empty, got:\n{out}"
    );
}
