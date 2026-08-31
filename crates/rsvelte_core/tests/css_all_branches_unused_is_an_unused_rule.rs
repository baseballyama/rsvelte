//! Upstream checks `is_empty` BEFORE `is_used` (`3-transform/css/index.js:146`),
//! and `is_empty` recurses: a rule with no declarations of its own is empty when
//! every nested rule under it is unused or itself empty. So a nested rule whose
//! whole `:is()` argument list is unused takes its declaration-less parent with
//! it, and the parent is what gets commented out.
//!
//! rsvelte's `is_empty` port already did that. What it could not see was the
//! nested rule being unused at all: the `:is()` compound asked the ISOLATED
//! branch check ("does an `a` exist?") instead of the marking walk's verdict
//! ("is an `a` also this `.row`?"), so the rule stayed used and only the
//! argument was commented.
//!
//! Every expectation is the official compiler's output for the same source.

use rsvelte_core::{CompileOptions, CssMode, GenerateMode, compile};

fn scoped_css(markup: &str, style: &str) -> String {
    let source = format!("{markup}\n<style>\n\t{style}\n</style>\n");
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
    .unwrap_or_else(|e| panic!("{style}: {e:?}"))
    .css
    .map(|c| c.code)
    .unwrap_or_default();
    let flat = css.split_whitespace().collect::<Vec<_>>().join(" ");
    let Some(start) = flat.find("svelte-") else {
        return flat;
    };
    let len = flat[start..]
        .char_indices()
        .find(|(i, c)| *i > 0 && !c.is_ascii_alphanumeric() && *c != '-')
        .map_or(flat.len() - start, |(i, _)| i);
    flat.replace(&flat[start..start + len], "HASH")
}

/// A `<div class="row">` whose only child is an `<a>`: the `.row` is not an `a`,
/// but an `a` does exist in the component.
const DIV: &str = r#"<div class="row"><a href="/">a</a></div>"#;

#[test]
fn a_rule_whose_every_branch_is_unused_empties_its_parent() {
    assert_eq!(
        scoped_css(DIV, ".row { &:is(a) { color: red; } }"),
        "/* (empty) .row { &:is(a) { color: red; } }*/"
    );
    assert_eq!(
        scoped_css(DIV, ".row { &:is(a, button) { color: red; } }"),
        "/* (empty) .row { &:is(a, button) { color: red; } }*/"
    );
}

#[test]
fn one_surviving_branch_keeps_the_rule() {
    // `div` matches the `.row` itself, so only the `span` branch is pruned and
    // the parent is not empty. This is what separates the fix from "an `:is()`
    // under `&` is always unused".
    assert_eq!(
        scoped_css(DIV, ".row { &:is(span, div) { color: red; } }"),
        ".row.HASH { &:is(/* (unused) span,*/ div:where(.HASH)) { color: red; } }"
    );
    assert_eq!(
        scoped_css(
            r#"<a class="row" href="/">a</a>"#,
            ".row { &:is(a) { color: red; } }"
        ),
        ".row.HASH { &:is(a:where(.HASH)) { color: red; } }"
    );
}

#[test]
fn a_declaration_on_the_parent_makes_it_unused_rather_than_empty() {
    // `is_empty` returns false at the first Declaration, so the parent survives
    // and the child is reported as unused instead — the two verdicts the
    // corpus reported swapped.
    assert_eq!(
        scoped_css(DIV, ".row { color: blue; .nope { color: red; } }"),
        ".row.HASH { color: blue; /* (unused) .nope { color: red; }*/ }"
    );
}

#[test]
fn the_other_empty_shapes_are_unchanged() {
    assert_eq!(scoped_css(DIV, ".row { }"), "/* (empty) .row { }*/");
    assert_eq!(scoped_css(DIV, ".nope { }"), "/* (empty) .nope { }*/");
    assert_eq!(
        scoped_css(DIV, ".nope { color: red; }"),
        "/* (unused) .nope { color: red; }*/"
    );
    assert_eq!(
        scoped_css(DIV, ".row { .nope { color: red; } }"),
        "/* (empty) .row { .nope { color: red; } }*/"
    );
    assert_eq!(
        scoped_css(DIV, ".row { .a { .nope { color: red; } } }"),
        "/* (empty) .row { .a { .nope { color: red; } } }*/"
    );
    assert_eq!(
        scoped_css(DIV, ".row { a { color: red; } }"),
        ".row.HASH { a:where(.HASH) { color: red; } }"
    );
    assert_eq!(
        scoped_css(DIV, ".row { div { color: red; } }"),
        "/* (empty) .row { div { color: red; } }*/"
    );
    assert_eq!(
        scoped_css(DIV, "@media (min-width: 1px) { .nope { color: red; } }"),
        "@media (min-width: 1px) { /* (unused) .nope { color: red; }*/ }"
    );
}
