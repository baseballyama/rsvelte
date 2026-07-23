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
