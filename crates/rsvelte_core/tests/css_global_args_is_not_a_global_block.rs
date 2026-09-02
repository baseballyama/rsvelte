//! Upstream decides "am I inside a global block" from `metadata.is_global_block`
//! (`3-transform/css/index.js:390-392`), which `is_global_block_selector` sets only
//! for a bare `:global` — `args === null` (`2-analyze/css/css-analyze.js:24-30`).
//! `:global(.foo) { … }` is an ordinary rule there, so `is_empty`'s
//! `(is_used(child) || is_in_global_block)` test does not fire and an UNUSED nested
//! rule stops counting toward its parent's non-emptiness.
//!
//! rsvelte splits that one concept across four predicates and the empty check read
//! the widest: `is_global_selector_rule` never looks at `args`, so every descendant
//! of a `:global(.foo)` rule was treated as living in a global block and kept a
//! parent whose only child is unused.
//!
//! The cells enumerate `is_empty`'s own branches rather than the reported shape, and
//! three of them are what make the grid discriminating: the outer declaration (without
//! it the whole outer rule is commented and the inner verdict is unreadable), the
//! depth (a direct child of a global-arguments rule is matched by that rule's own
//! subject, so the leaf only goes unused behind an intermediate compound), and `dev`
//! (which elides no rule at all, so every cell here must be immobile under it).
//!
//! Every expectation is the official compiler's own output for the same source.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn css(markup: &str, style: &str) -> String {
    css_dev(markup, style, false)
}

fn css_dev(markup: &str, style: &str, dev: bool) -> String {
    let source = format!("{markup}\n<style>\n\t{style}\n</style>\n");
    let out = compile(
        &source,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .unwrap_or_else(|err| panic!("{style}: {err:?}"))
    .css
    .map(|c| c.code)
    .unwrap_or_default();
    let Some(start) = out.find("svelte-") else {
        return out;
    };
    let len = out[start..]
        .char_indices()
        .find(|(i, c)| *i > 0 && !c.is_ascii_alphanumeric() && *c != '-')
        .map_or(out.len() - start, |(i, _)| i);
    out.replace(&out[start..start + len], "HASH")
}

/// The template carries no element at all: a `&` under a fully-global parent
/// matches every element, so one stray tag makes the nested `:global(i)` used and
/// the whole shape stops discriminating.
#[test]
fn an_unused_child_of_a_global_arguments_rule_empties_its_parent() {
    let out = css(
        "",
        ":global(.g) {\n\t\twidth: 20px;\n\t\t&:disabled { & :global(i) { color: green; } }\n\t}",
    );
    assert_eq!(
        out,
        "\n\t.g {\n\t\twidth: 20px;\n\t\t/* (empty) &:disabled { & :global(i) { color: green; } }*/\n\t}\n"
    );
}

/// A declaration still decides non-emptiness on its own, so the sibling rule that
/// has one keeps its body and only the unused child is commented.
#[test]
fn a_declaration_keeps_the_parent_of_the_same_unused_child() {
    let out = css(
        "",
        ":global(.g) {\n\t\twidth: 20px;\n\t\t&:hover { color: red; & :global(i) { color: blue; } }\n\t}",
    );
    assert_eq!(
        out,
        "\n\t.g {\n\t\twidth: 20px;\n\t\t&:hover { color: red; /* (unused) & :global(i) { color: blue; }*/ }\n\t}\n"
    );
}

/// The other direction: inside a BARE `:global` block nothing is commented at all.
/// No cell can reject a fix that passes `false` here instead of the flag, and that
/// is a property of the compiler rather than of this grid — a selector inside a bare
/// global block is never marked unused, so `is_used(child) || is_in_global_block` is
/// already true without it. Measured: over the 181 CSS fixtures the site is reached
/// 851 times, the flag is `true` 14 times, and the two arguments give a different
/// `is_rule_empty` answer 0 times. The faithful spelling is kept because it is what
/// upstream's `is_in_global_block(path)` says; only the `true` degenerate is
/// rejectable, and three cells below reject it.
#[test]
fn an_unused_child_inside_a_bare_global_block_still_keeps_its_parent() {
    let out = css(
        "",
        ":global {\n\t\t.g { &:disabled { & span { color: green; } } }\n\t}",
    );
    assert_eq!(
        out,
        "\n\t/* :global {*/\n\t\t.g { &:disabled { & span { color: green; } } }\n\t/*}*/\n"
    );
}

/// The plain-parent control, which needs its element to be reached at all. A fix
/// that passes the flag unconditionally turns this back into a kept `&:disabled`.
#[test]
fn an_unused_child_of_a_local_rule_empties_its_parent() {
    let out = css(
        "<b class=\"loc\">x</b>",
        ".loc {\n\t\ttop: 0;\n\t\t&:disabled { & span { color: green; } }\n\t}",
    );
    assert_eq!(
        out,
        "\n\t.loc.HASH {\n\t\ttop: 0;\n\t\t/* (empty) &:disabled { & span { color: green; } }*/\n\t}\n"
    );
}

/// The outer declaration is what makes the cells above readable at all: drop it and
/// the outer rule is empty on its own, so official comments the whole thing out and
/// the child's verdict is no longer in the output. A grid without this axis reports
/// no movement for either arm of the fix.
#[test]
fn without_the_outer_declaration_the_whole_rule_is_commented_and_hides_the_child() {
    let out = css(
        "",
        ":global(.g) {\n\t\t&:disabled { & :global(i) { color: green; } }\n\t}",
    );
    assert_eq!(
        out,
        "\n\t/* (empty) :global(.g) {\n\t\t&:disabled { & :global(i) { color: green; } }\n\t}*/\n"
    );
}

/// Depth is the other held constant. A DIRECT child of a global-arguments rule is
/// matched through that rule's own subject, so it is used and nothing is commented —
/// the leaf only goes unused behind an intermediate compound that matches no element.
#[test]
fn a_direct_child_of_a_global_arguments_rule_is_used() {
    let out = css(
        "",
        ":global(.g) {\n\t\twidth: 20px;\n\t\t& :global(i) { color: green; }\n\t}",
    );
    assert_eq!(
        out,
        "\n\t.g {\n\t\twidth: 20px;\n\t\t& i { color: green; }\n\t}\n"
    );
}

/// `dev` elides no rule, so every cell above is immobile under it and the same four
/// sources come back as `(unused)` annotations on the leaf. A fix that reached the
/// dev path too would show up here and nowhere else in this file.
#[test]
fn no_cell_in_this_file_moves_under_dev() {
    assert_eq!(
        css_dev(
            "",
            ":global(.g) {\n\t\twidth: 20px;\n\t\t&:disabled { & :global(i) { color: green; } }\n\t}",
            true
        ),
        "\n\t.g {\n\t\twidth: 20px;\n\t\t&:disabled { /* (unused) & :global(i) { color: green; }*/ }\n\t}\n"
    );
    assert_eq!(
        css_dev(
            "",
            ":global(.g) {\n\t\twidth: 20px;\n\t\t&:hover { color: red; & :global(i) { color: blue; } }\n\t}",
            true
        ),
        "\n\t.g {\n\t\twidth: 20px;\n\t\t&:hover { color: red; /* (unused) & :global(i) { color: blue; }*/ }\n\t}\n"
    );
    assert_eq!(
        css_dev(
            "",
            ":global {\n\t\t.g { height: 20px; &:disabled { & span { color: green; } } }\n\t}",
            true
        ),
        "\n\t/* :global {*/\n\t\t.g { height: 20px; &:disabled { & span { color: green; } } }\n\t/*}*/\n"
    );
    assert_eq!(
        css_dev(
            "<b class=\"loc\">x</b>",
            ".loc {\n\t\ttop: 0;\n\t\t&:disabled { & span { color: green; } }\n\t}",
            true
        ),
        "\n\t.loc.HASH {\n\t\ttop: 0;\n\t\t&:disabled { /* (unused) & span { color: green; }*/ }\n\t}\n"
    );
}
