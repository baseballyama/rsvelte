//! An `:is()` / `:where()` / `:has()` argument constrains the *same* element its
//! enclosing compound does, so it is not a nesting level. rsvelte's isolated
//! branch check said so in its doc comment and then ran with the enclosing
//! rule's parent preludes still in the context, which asks a bare `a` inside
//! `.row { &:is(a) { … } }` whether an `<a>` sits *below* a `.row` — and in
//! `<a class="row">` the `<a>` IS the `.row`.
//!
//! Every expectation below is the official compiler's output for the same
//! source, with the scope hash replaced.

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

const LINK: &str = r#"<a class="row" href="/">a</a>"#;
const DIV: &str = r#"<div class="row"><a href="/">a</a></div>"#;

#[test]
fn a_type_argument_is_matched_against_the_element_the_ampersand_stands_for() {
    assert_eq!(
        scoped_css(LINK, ".row { &:is(a) { color: blue; } color: red; }"),
        ".row.HASH { &:is(a:where(.HASH)) { color: blue; } color: red; }"
    );
    assert_eq!(
        scoped_css(LINK, ".row { &:is(a, button) { color: red; } }"),
        ".row.HASH { &:is(a:where(.HASH) /* (unused) button*/) { color: red; } }"
    );
}

#[test]
fn a_class_argument_behaves_the_same_way() {
    // The defect is not about type selectors: any argument was being asked the
    // descendant question.
    assert_eq!(
        scoped_css(
            r#"<a class="row zz" href="/">a</a>"#,
            ".row { &:is(.zz) { color: blue; } color: red; }"
        ),
        ".row.HASH { &:is(.zz:where(.HASH)) { color: blue; } color: red; }"
    );
}

#[test]
fn an_argument_that_really_cannot_match_is_still_pruned() {
    // The fix must not become "never prune an argument": under a `<div class="row">`
    // the `span` branch matches nothing and only `div` survives.
    assert_eq!(
        scoped_css(DIV, ".row { &:is(span, div) { color: red; } }"),
        ".row.HASH { &:is(/* (unused) span,*/ div:where(.HASH)) { color: red; } }"
    );
}

#[test]
fn the_flat_and_ampersand_free_forms_are_unchanged() {
    // Neither axis alone reproduces the defect, so both belong in the pin: a
    // flat `:is()` and an `&` compound without a functional pseudo.
    assert_eq!(
        scoped_css(LINK, ".row:is(a, button) { color: red; }"),
        ".row.HASH:is(a:where(.HASH) /* (unused) button*/) { color: red; }"
    );
    assert_eq!(
        scoped_css(LINK, ".row { &a { color: red; } }"),
        ".row.HASH { &a { color: red; } }"
    );
    assert_eq!(
        scoped_css(LINK, ".row { &.row { color: red; } }"),
        ".row.HASH { &.row { color: red; } }"
    );
    assert_eq!(
        scoped_css(LINK, ".row { &:hover { color: red; } }"),
        ".row.HASH { &:hover { color: red; } }"
    );
}
