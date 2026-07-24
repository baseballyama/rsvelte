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

// Negative controls: the fix must not blanket-keep `:global(.a) + .b` inside
// opaque fragments. When `.b` has no real `.a` sibling, is not a root-level
// element, and does not follow an opaque boundary, it is still pruned — matching
// `svelte/compiler`.

#[test]
fn global_plus_no_sibling_in_await_nested_pruned() {
    // `.b` is nested under `<section>` (not root) with no preceding `.a`.
    let out = css("<script>let promise = Promise.resolve(1);</script>\n\
         {#await promise}{:then _}<section><div class=\"b\"></div></section>{/await}\n\
         <style>:global(.a) + .b { color: red; }</style>");
    assert!(
        out.contains("(unused)"),
        "unmatched `:global(.a) + .b` must be pruned, got:\n{out}"
    );
    assert!(
        !out.contains(".b.svelte-"),
        "`.b` must not be scoped in:\n{out}"
    );
}

#[test]
fn global_plus_no_sibling_in_snippet_nested_pruned() {
    let out = css(
        "{#snippet s()}<section><div class=\"b\"></div></section>{/snippet}\n{@render s()}\n\
         <style>:global(.a) + .b { color: red; }</style>",
    );
    assert!(
        out.contains("(unused)"),
        "unmatched `:global(.a) + .b` must be pruned, got:\n{out}"
    );
}

#[test]
fn global_descendant_inner_with_ancestor_kept() {
    // Issue #1719: `:global(.a .z) + .b` where the `.z` sibling of `.b` really
    // has an `.a` ancestor. The inner descendant chain's ancestor constraint is
    // satisfied, so the official compiler keeps the rule and scopes `.b`
    // (`.a .z + .b.svelte-xxx`). Previously rsvelte only resolved single-relative
    // `:global(...)` inners and over-pruned this as `(unused)`.
    let out = css(
        "<div class=\"a\"><span class=\"z\"></span><div class=\"b\"></div></div>\n\
         <style>:global(.a .z) + .b { color: red; }</style>",
    );
    assert_kept(&out);
}

#[test]
fn global_child_inner_with_ancestor_kept() {
    // Same fix for a `>` child chain inside `:global(...)`.
    let out = css(
        "<div class=\"a\"><span class=\"z\"></span><div class=\"b\"></div></div>\n\
         <style>:global(.a > .z) + .b { color: red; }</style>",
    );
    assert_kept(&out);
}

#[test]
fn global_descendant_inner_without_ancestor_pruned() {
    // `:global(.a .z) + .b`: the `.z` sibling of `.b` has no `.a` ancestor. The
    // inner `.a .z` carries an ancestor constraint the compound matcher can't
    // verify, so it must not over-keep — pruned as `(unused)`, matching upstream.
    let out = css(
        "<section><span class=\"z\"></span><div class=\"b\"></div></section>\n\
         <style>:global(.a .z) + .b { color: red; }</style>",
    );
    assert!(
        out.contains("(unused)"),
        "`:global(.a .z) + .b` without `.a` ancestor must be pruned, got:\n{out}"
    );
}
