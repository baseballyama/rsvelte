//! Regression tests for issue #1735 — the multi-relative ancestor `Chain`
//! resolution used by the `+`/`~` prune check (`:global(.a .z) + .b`, and a bare
//! `&` resolved against a multi-relative parent prelude such as
//! `.foo > .a { & + & }`) walked `parent_idx` without checking that the lexical
//! parent chain actually models the real DOM ancestry.
//!
//! It does not when the component contains `{#snippet}` bodies (a
//! snippet-declared element's real ancestors come from its `{@render}` call
//! sites) or a `<selectedcontent>` (which mirrors the selected `<option>`'s
//! subtree). In those templates the chain must be treated as unresolvable and
//! the rule kept, rather than either trusting the lexical walk or dropping to
//! the compound-only fallback (which discards the ancestor constraint and
//! prunes).

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
}

fn assert_pruned(out: &str) {
    assert!(
        out.contains("(unused)") || out.contains("(empty)"),
        "rule must be pruned, got:\n{out}"
    );
}

/// `<selectedcontent>` clones the selected `<option>`'s content, so upstream
/// treats elements inside an `<option>` as descendants of the
/// `<selectedcontent>` too. The lexical walk sees only `option`, so the `Chain`
/// found no `.a` under `selectedcontent` and wrongly pruned the rule.
#[test]
fn selectedcontent_ancestor_chain_kept() {
    let out = css("<select>\n  <selectedcontent></selectedcontent>\n  \
         <option><div class=\"a\"></div><div class=\"a\"></div></option>\n</select>\n\
         <style>selectedcontent > .a { & + & { color: red; } }</style>");
    assert_kept(&out);
}

/// A snippet body rendered under a *different* ancestor than the one the
/// prelude requires. The lexical walk cannot follow `{@render}`, so the chain is
/// unresolvable and the rule is kept.
#[test]
fn snippet_rendered_under_matching_ancestor_kept() {
    let out = css("<div class=\"foo\">\n  {@render pair()}\n</div>\n\
         {#snippet pair()}\n  <div class=\"a\"></div><div class=\"a\"></div>\n{/snippet}\n\
         <style>.foo > .a { & + & { color: red; } }</style>");
    assert_kept(&out);
}

/// Same for the `:global(X) + Y` inner-chain resolution.
#[test]
fn global_inner_chain_with_snippet_kept() {
    let out = css(
        "<div class=\"foo\">\n  <div class=\"z\"></div>\n  {@render one()}\n</div>\n\
         {#snippet one()}<div class=\"b\"></div>{/snippet}\n\
         <style>:global(.foo .z) + .b { color: red; }</style>",
    );
    assert_kept(&out);
}

/// `svelte:element` does *not* remap ancestry — the dynamic element is a real
/// node at a known position and `is_dynamic_tag` already relaxes tag matching —
/// so the chain stays resolvable and `.foo > .a` still prunes when the dynamic
/// element sits between `.foo` and the `.a` pair.
#[test]
fn dynamic_element_between_ancestor_and_subject_still_pruned() {
    let out = css("<script>let tag = 'div';</script>\n\
         <div class=\"foo\"><svelte:element this={tag}>\
         <div class=\"a\"></div><div class=\"a\"></div></svelte:element></div>\n\
         <style>.foo > .a { & + & { color: red; } }</style>");
    assert_pruned(&out);
}

#[test]
fn global_inner_chain_with_dynamic_element_still_pruned() {
    let out = css("<script>let tag = 'div';</script>\n\
         <div class=\"foo\"><svelte:element this={tag}>\
         <div class=\"z\"></div><div class=\"b\"></div></svelte:element></div>\n\
         <style>:global(.foo > .z) + .b { color: red; }</style>");
    assert_pruned(&out);
}

/// The guard must not weaken the snippet-free cases #1728 fixed: the ancestor
/// constraint is still verified there.
#[test]
fn no_snippet_ancestor_chain_still_evaluated() {
    let kept = css(
        "<div class=\"foo\"><div class=\"a\"></div><div class=\"a\"></div></div>\n\
         <style>.foo > .a { & + & { color: red; } }</style>",
    );
    assert_kept(&kept);

    let pruned = css(
        "<div class=\"foo\"><span>x</span></div><div class=\"a\"></div><div class=\"a\"></div>\n\
         <style>.foo > .a { & + & { color: red; } }</style>",
    );
    assert_pruned(&pruned);
}

/// The only render site of the `.a` pair is `<section>`, not `.foo`, so the
/// ancestor constraint can never hold and the rule is pruned.
#[test]
fn snippet_rendered_under_mismatched_ancestor_pruned() {
    let out = css("<div class=\"foo\"><span>irrelevant</span></div>\n\
         {#snippet pair()}\n  <div class=\"a\"></div><div class=\"a\"></div>\n{/snippet}\n\
         <section>\n  {@render pair()}\n</section>\n\
         <style>.foo > .a { & + & { color: red; } }</style>");
    assert_pruned(&out);
}

/// The same mismatch without any `&`/sibling chain: a lone snippet-declared
/// `.a` rendered under `<section>` cannot satisfy `.foo > .a`.
#[test]
fn snippet_render_site_ancestry_simple_chain_pruned() {
    let out = css("<div class=\"foo\"><span>irrelevant</span></div>\n\
         {#snippet one()}\n  <div class=\"a\"></div>\n{/snippet}\n\
         <section>\n  {@render one()}\n</section>\n\
         <style>.foo > .a { color: red; }</style>");
    assert_pruned(&out);
}

/// …but when a render site *is* under `.foo`, the union of sites keeps it.
#[test]
fn snippet_render_site_union_keeps_matching_site() {
    let out = css("<div class=\"foo\">{@render one()}</div>\n\
         {#snippet one()}\n  <div class=\"a\"></div>\n{/snippet}\n\
         <section>\n  {@render one()}\n</section>\n\
         <style>.foo > .a { color: red; }</style>");
    assert_kept(&out);
}
