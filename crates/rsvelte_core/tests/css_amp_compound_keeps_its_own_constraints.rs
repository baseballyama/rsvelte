//! `&` contributes the parent's constraints; the rest of the compound around it
//! contributes its own. An element matching `&.dragging` still has to carry
//! `dragging`, and `&span` still has to be a `<span>`.
//!
//! rsvelte's parent-chain check bailed out the moment it saw a `NestingSelector`
//! and reported the whole alternative as matching, which threw the sibling
//! constraints away — so a nested rule under `&.dragging` stayed used on a
//! component that has no `.dragging`, and its declaration-less parent never
//! became `(empty)`.
//!
//! A compound that is only `&` extracts no constraints at all and still falls
//! out through the existing "nothing to test, assume it matches" branch, which
//! is what keeps this from over-pruning.
//!
//! Every expectation is the official compiler's output for the same source.
//!
//! These rows no longer discriminate: with the `NestingSelector` arm restored to
//! its pre-fix `return true`, all six still pass, because another path reaches
//! the same verdict first. What guards that arm is the corpus warning ratchet
//! (four `css_unused_selector` entries move), not this file.

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
    let mut out = String::with_capacity(flat.len());
    let mut rest = flat.as_str();
    while let Some(start) = rest.find("svelte-") {
        out.push_str(&rest[..start]);
        out.push_str("HASH");
        let tail = &rest[start + "svelte-".len()..];
        let end = tail
            .find(|c: char| !c.is_ascii_alphanumeric() && c != '-')
            .unwrap_or(tail.len());
        rest = &tail[end..];
    }
    out.push_str(rest);
    out
}

const PLAIN: &str = r#"<div class="container"><i>x</i></div>"#;
const DRAGGING: &str = r#"<div class="container dragging"><i>x</i></div>"#;
const DYNAMIC: &str = r#"<div class="container" class:dragging={x}><i>x</i></div>"#;

#[test]
fn a_class_beside_the_ampersand_still_has_to_be_present() {
    assert_eq!(
        scoped_css(
            PLAIN,
            ".container { color: blue; &.dragging { * { color: red; } } }"
        ),
        ".container.HASH { color: blue; /* (empty) &.dragging { * { color: red; } }*/ }"
    );
    assert_eq!(
        scoped_css(
            PLAIN,
            ".container { color: blue; &.dragging { i { color: red; } } }"
        ),
        ".container.HASH { color: blue; /* (empty) &.dragging { i { color: red; } }*/ }"
    );
    assert_eq!(
        scoped_css(
            PLAIN,
            ".container { color: blue; &.dragging { *, i { color: red; } } }"
        ),
        ".container.HASH { color: blue; /* (empty) &.dragging { *, i { color: red; } }*/ }"
    );
}

#[test]
fn an_id_or_a_type_beside_the_ampersand_counts_the_same_way() {
    assert_eq!(
        scoped_css(
            PLAIN,
            ".container { color: blue; &#nope { i { color: red; } } }"
        ),
        ".container.HASH { color: blue; /* (empty) &#nope { i { color: red; } }*/ }"
    );
    assert_eq!(
        scoped_css(
            PLAIN,
            ".container { color: blue; &span { i { color: red; } } }"
        ),
        ".container.HASH { color: blue; /* (empty) &span { i { color: red; } }*/ }"
    );
    // The `.container` IS a div, so the same shape has to survive.
    assert_eq!(
        scoped_css(
            PLAIN,
            ".container { color: blue; &div { i { color: red; } } }"
        ),
        ".container.HASH { color: blue; &div { i:where(.HASH) { color: red; } } }"
    );
}

#[test]
fn the_constraint_being_satisfied_keeps_the_rule() {
    // The over-prune direction. Every row here is unchanged by the fix, and a
    // check that dropped the `&` instead of reading past it would break them.
    assert_eq!(
        scoped_css(
            DRAGGING,
            ".container { color: blue; &.dragging { * { color: red; } } }"
        ),
        ".container.HASH { color: blue; &.dragging { :where(.HASH) { color: red; } } }"
    );
    assert_eq!(
        scoped_css(
            DRAGGING,
            ".container { color: blue; &.dragging { i { color: red; } } }"
        ),
        ".container.HASH { color: blue; &.dragging { i:where(.HASH) { color: red; } } }"
    );
    // A class that only ever appears through `class:` is dynamic, so it can
    // match at runtime and nothing may be pruned on it.
    assert_eq!(
        scoped_css(
            DYNAMIC,
            ".container { color: blue; &.dragging { i { color: red; } } }"
        ),
        ".container.HASH { color: blue; &.dragging { i:where(.HASH) { color: red; } } }"
    );
    assert_eq!(
        scoped_css(
            PLAIN,
            ".container { color: blue; &:global(.dragging) { i { color: red; } } }"
        ),
        ".container.HASH { color: blue; &.dragging { i:where(.HASH) { color: red; } } }"
    );
    assert_eq!(
        scoped_css(
            PLAIN,
            ".container { color: blue; &:hover { i { color: red; } } }"
        ),
        ".container.HASH { color: blue; &:hover { i:where(.HASH) { color: red; } } }"
    );
}

#[test]
fn a_bare_ampersand_constrains_nothing() {
    assert_eq!(
        scoped_css(PLAIN, ".container { color: blue; & { color: red; } }"),
        ".container.HASH { color: blue; & { color: red; } }"
    );
}

#[test]
fn a_compound_carrying_its_own_declarations_is_unused_rather_than_empty() {
    assert_eq!(
        scoped_css(
            PLAIN,
            ".container { color: blue; &.dragging { color: red; } }"
        ),
        ".container.HASH { color: blue; /* (unused) &.dragging { color: red; }*/ }"
    );
    assert_eq!(
        scoped_css(
            DRAGGING,
            ".container { color: blue; &.dragging { color: red; } }"
        ),
        ".container.HASH { color: blue; &.dragging { color: red; } }"
    );
}

#[test]
fn each_alternative_is_judged_on_its_own() {
    assert_eq!(
        scoped_css(
            PLAIN,
            ".container, .other { color: blue; &.dragging { i { color: red; } } }"
        ),
        ".container.HASH /* (unused) .other*/ { color: blue; /* (empty) &.dragging { i { color: red; } }*/ }"
    );
    // One surviving alternative keeps the rule: `&.container` is satisfied.
    assert_eq!(
        scoped_css(
            PLAIN,
            ".container { color: blue; &.dragging, &.container { i { color: red; } } }"
        ),
        ".container.HASH { color: blue; /* (unused) &.dragging,*/ &.container { i:where(.HASH) { color: red; } } }"
    );
}
