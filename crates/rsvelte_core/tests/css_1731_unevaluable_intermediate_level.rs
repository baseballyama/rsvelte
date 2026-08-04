//! Regression tests for issue #1731 — an *intermediate* nesting level with a
//! shape `level_is_structurally_evaluable` could not evaluate (a comma list, a
//! bare `:is()`/`:where()`, or a sibling combinator) made `build_parent_chain`
//! bail all-or-nothing to `None`, so a nested `&`'s sibling-combinator prune
//! check (e.g. `& + &`) fell back to the empty compound `Info` matcher and the
//! whole rule was pruned — even though the ancestor constraint is actually
//! satisfiable. Upstream resolves `&` per branch (OR-ing across comma
//! alternatives and expanding `:is()`/`:where()`) instead of bailing, and
//! verifies sibling combinators against the real sibling relationship, so all
//! three shapes below must keep the inner rule.

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
    assert!(!out.contains("(empty)"), "rule must be kept, got:\n{out}");
}

fn assert_pruned(out: &str) {
    assert!(
        out.contains("(unused)") || out.contains("(empty)"),
        "rule must be pruned, got:\n{out}"
    );
}

/// Example 1: a comma-separated intermediate level. The `.grand` branch
/// matches the real ancestry, so the rule must be kept (only the unmatched
/// `.other` branch is marked `(unused)`), not the whole rule pruned.
#[test]
fn comma_intermediate_level_kept() {
    let out = css("<div class=\"grand\"><div class=\"foo\">\
         <div class=\"a\"></div><div class=\"a\"></div>\
         </div></div>\n\
         <style>.grand, .other { .foo > .a { & + & { color: red; } } }</style>");
    assert_kept(&out);
}

/// Example 2: a bare `:is(...)` intermediate level must expand to its inner
/// selector list rather than making the whole chain unevaluable.
#[test]
fn functional_pseudo_intermediate_level_kept() {
    let out = css("<div class=\"grand\"><div class=\"foo\">\
         <div class=\"a\"></div><div class=\"a\"></div>\
         </div></div>\n\
         <style>:is(.grand) { .foo > .a { & + & { color: red; } } }</style>");
    assert_kept(&out);
}

/// Example 3: a sibling-combinator intermediate level must be verified via
/// the real sibling relationship rather than bailing the whole chain.
#[test]
fn sibling_combinator_intermediate_level_kept() {
    let out = css("<div class=\"x\"></div>\n\
         <div class=\"grand\"><div class=\"foo\">\
         <div class=\"a\"></div><div class=\"a\"></div>\
         </div></div>\n\
         <style>.x + .grand { .foo > .a { & + & { color: red; } } }</style>");
    assert_kept(&out);
}

/// Negative counterpart for the comma case: neither `.grand` nor `.other`
/// actually contains the `.a` pair, so the rule must still be pruned.
#[test]
fn comma_intermediate_level_still_pruned_when_unsatisfied() {
    let out = css("<div class=\"unrelated\"><div class=\"foo\">\
         <div class=\"a\"></div><div class=\"a\"></div>\
         </div></div>\n\
         <style>.grand, .other { .foo > .a { & + & { color: red; } } }</style>");
    assert_pruned(&out);
}

/// Negative counterpart for the `:is()` case.
#[test]
fn functional_pseudo_intermediate_level_still_pruned_when_unsatisfied() {
    let out = css("<div class=\"unrelated\"><div class=\"foo\">\
         <div class=\"a\"></div><div class=\"a\"></div>\
         </div></div>\n\
         <style>:is(.grand) { .foo > .a { & + & { color: red; } } }</style>");
    assert_pruned(&out);
}

/// Negative counterpart for the sibling-combinator case: `.x` is not
/// immediately followed by `.grand`, so the rule must still be pruned.
#[test]
fn sibling_combinator_intermediate_level_still_pruned_when_unsatisfied() {
    let out = css("<div class=\"x\"></div>\n\
         <div class=\"between\"></div>\n\
         <div class=\"grand\"><div class=\"foo\">\
         <div class=\"a\"></div><div class=\"a\"></div>\
         </div></div>\n\
         <style>.x + .grand { .foo > .a { & + & { color: red; } } }</style>");
    assert_pruned(&out);
}
