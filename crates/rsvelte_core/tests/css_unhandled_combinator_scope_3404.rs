//! Which compounds get the scoping class when a complex selector contains a
//! combinator upstream does not handle (#3404, second half).
//!
//! `apply_combinator` in `css-prune.js` ends on `default: return true` without
//! recursing, so `||` halts the backward walk: everything to its left is never
//! visited, is never marked `metadata.scoped`, and is never consulted when
//! deciding whether the rule is used. Both facts are observable — the left side
//! keeps its bare source text, and a left side that matches nothing does not
//! prune the rule. The handled combinators are here as controls; each
//! expectation is the official compiler's verbatim answer at the pinned Svelte
//! revision.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

const MARKUP: &str = "<div class=\"a\"><section class=\"b\"><span class=\"c\">t</span></section></div><p class=\"d\">u</p>";

fn css_of(style: &str) -> String {
    let source = format!("{MARKUP}\n<style>\n\t{style}\n</style>\n");
    let result = compile(
        &source,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .unwrap_or_else(|err| panic!("`{style}` should compile: {err:?}"));
    result.css.map(|css| css.code).unwrap_or_default()
}

fn check(style: &str, expected: &str) {
    assert_eq!(css_of(style), format!("\n\t{expected}\n"), "for `{style}`");
}

#[test]
fn only_the_subject_side_of_an_unhandled_combinator_is_scoped() {
    check(
        ".a || .b { color: red }",
        ".a || .b.svelte-70s02x { color: red }",
    );
    check(
        ".a || .b || .c { color: red }",
        ".a || .b || .c.svelte-70s02x { color: red }",
    );
}

#[test]
fn the_walk_resumes_on_handled_combinators_to_the_right() {
    check(
        ".a || .b > .c { color: red }",
        ".a || .b.svelte-70s02x > .c:where(.svelte-70s02x) { color: red }",
    );
    check(
        ".a || .b .c { color: red }",
        ".a || .b.svelte-70s02x .c:where(.svelte-70s02x) { color: red }",
    );
}

#[test]
fn a_handled_combinator_to_the_left_is_still_out_of_reach() {
    check(
        ".a > .b || .c { color: red }",
        ".a > .b || .c.svelte-70s02x { color: red }",
    );
    check(
        ".a .b || .c { color: red }",
        ".a .b || .c.svelte-70s02x { color: red }",
    );
}

#[test]
fn the_unreachable_side_does_not_decide_whether_the_rule_is_used() {
    // `.zz` matches nothing, and `.b + .d` is a sibling relationship the markup
    // does not have; neither is ever tested, so the rule survives on `.b` / `.c`.
    check(
        ".zz || .b { color: red }",
        ".zz || .b.svelte-70s02x { color: red }",
    );
    check(
        ".b + .d || .c { color: red }",
        ".b + .d || .c.svelte-70s02x { color: red }",
    );
}

#[test]
fn the_reachable_side_alone_can_still_prune_the_rule() {
    check(
        ".a || .zz { color: red }",
        "/* (unused) .a || .zz { color: red }*/",
    );
    check(
        ".a .b || .c > .d { color: red }",
        "/* (unused) .a .b || .c > .d { color: red }*/",
    );
}

#[test]
fn a_trailing_global_does_not_become_the_subject() {
    // `truncate` drops the trailing `:global(...)`, so `.a` is the subject and is
    // reached despite the `||` to its right.
    check(
        ".a || :global(.x) { color: red }",
        ".a.svelte-70s02x || .x { color: red }",
    );
    check(
        ":global(.x) || .b { color: red }",
        ".x || .b.svelte-70s02x { color: red }",
    );
}

#[test]
fn handled_combinators_scope_both_sides() {
    check(
        ".a .b { color: red }",
        ".a.svelte-70s02x .b:where(.svelte-70s02x) { color: red }",
    );
    check(
        ".a > .b { color: red }",
        ".a.svelte-70s02x > .b:where(.svelte-70s02x) { color: red }",
    );
    check(
        ".a + .d { color: red }",
        ".a.svelte-70s02x + .d:where(.svelte-70s02x) { color: red }",
    );
    check(
        ".a ~ .d { color: red }",
        ".a.svelte-70s02x ~ .d:where(.svelte-70s02x) { color: red }",
    );
}
