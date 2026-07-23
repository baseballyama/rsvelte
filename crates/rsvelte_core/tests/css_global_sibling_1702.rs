//! Regression tests for issue #1702 — `:global(.a) + .b` was wrongly pruned as
//! `/* (unused) */` when the matching sibling pair lived inside an
//! `{#await}…{:then}` branch or a `{#snippet}` fragment rendered with
//! `{@render}`. The official compiler keeps the rule and scopes the trailing
//! segment (`.a + .b.svelte-xxx`).
//!
//! Root cause: `{#await}` branches and `{#snippet}` bodies both set
//! `css.has_opaque_elements`, which forced the `:global(X) + Y` prune check down
//! a branch that only accepted Y when Y immediately followed an opaque boundary.
//! A real previous sibling `.a` (a plain element) is not an opaque boundary, so
//! the rule was pruned. The fix unions the acceptable predecessors: a real
//! previous sibling matching the inner `:global(...)` selector, an opaque
//! boundary, or Y being a root-level element (the global `.a` may be injected by
//! the parent). `{#each}` / `{#if}` / `{#key}` already worked because they do
//! not set `has_opaque_elements`.

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

fn assert_kept(out: &str) {
    assert!(!out.contains("(unused)"), "rule must be kept, got:\n{out}");
    assert!(!out.contains("(empty)"), "rule must be kept, got:\n{out}");
    // The trailing `.b` is scoped, the leading `:global(.a)` stays unscoped.
    assert!(
        out.contains(".b.svelte-"),
        "expected scoped `.b` in:\n{out}"
    );
}

#[test]
fn global_plus_scoped_in_await_then_kept() {
    let out = css("<script>let promise = Promise.resolve(1);</script>\n\
         {#await promise}{:then _}<div class=\"a\"></div><div class=\"b\"></div>{/await}\n\
         <style>:global(.a) + .b { color: red; }</style>");
    assert_kept(&out);
}

#[test]
fn global_plus_scoped_in_snippet_render_kept() {
    let out = css(
        "{#snippet s()}<div class=\"a\"></div><div class=\"b\"></div>{/snippet}\n{@render s()}\n\
         <style>:global(.a) + .b { color: red; }</style>",
    );
    assert_kept(&out);
}

#[test]
fn global_general_sibling_in_await_then_kept() {
    let out = css("<script>let promise = Promise.resolve(1);</script>\n\
         {#await promise}{:then _}<div class=\"a\"></div><span></span><div class=\"b\"></div>{/await}\n\
         <style>:global(.a) ~ .b { color: red; }</style>");
    assert_kept(&out);
}

#[test]
fn global_plus_scoped_in_if_kept() {
    // Already worked before the fix ({#if} does not set has_opaque_elements);
    // pinned to guard against regressions.
    let out = css("<script>let cond = true;</script>\n\
         {#if cond}<div class=\"a\"></div><div class=\"b\"></div>{/if}\n\
         <style>:global(.a) + .b { color: red; }</style>");
    assert_kept(&out);
}
