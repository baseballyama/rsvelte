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
//!
//! Svelte 5.57.1 moved five of the ten cells: `prune()` now marks a complex
//! selector used when `every_is_global(...)` holds, so `& :global(i)` under a
//! `:global(.g)` parent no longer depends on this component rendering anything
//! (sveltejs/svelte#18793). The `& span` cells did not move, and they are what
//! keeps the original axis — `:global(args)` is not a global block — readable.

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

/// The template carries no element at all, so nothing here is used by matching:
/// the leaf survives because `& :global(i)` is global end to end and `prune()`
/// marks such a selector used without consulting the elements at all.
#[test]
fn a_fully_global_child_of_a_global_arguments_rule_is_used() {
    let out = css(
        "",
        ":global(.g) {\n\t\twidth: 20px;\n\t\t&:disabled { & :global(i) { color: green; } }\n\t}",
    );
    assert_eq!(
        out,
        "\n\t.g {\n\t\twidth: 20px;\n\t\t&:disabled { & i { color: green; } }\n\t}\n"
    );
}

/// The sibling shape with a declaration of its own. Both halves are kept, which is
/// what distinguishes this from the `& span` cells below: there the declaration is
/// the only reason the parent survives.
#[test]
fn a_declaration_and_a_global_child_are_both_kept() {
    let out = css(
        "",
        ":global(.g) {\n\t\twidth: 20px;\n\t\t&:hover { color: red; & :global(i) { color: blue; } }\n\t}",
    );
    assert_eq!(
        out,
        "\n\t.g {\n\t\twidth: 20px;\n\t\t&:hover { color: red; & i { color: blue; } }\n\t}\n"
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

/// The outer declaration is the axis this grid holds: without it the outer rule has
/// nothing but the child, so the child's verdict decides the whole rule. It is kept,
/// which is the same verdict as the cell above reached with a declaration present.
#[test]
fn without_the_outer_declaration_the_global_child_still_keeps_the_rule() {
    let out = css(
        "",
        ":global(.g) {\n\t\t&:disabled { & :global(i) { color: green; } }\n\t}",
    );
    assert_eq!(
        out,
        "\n\t.g {\n\t\t&:disabled { & i { color: green; } }\n\t}\n"
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

/// `dev` elides no rule, so a leaf that goes unused comes back as an `(unused)`
/// annotation rather than a deletion. The two `& :global(i)` sources are kept
/// outright under both modes; only the local `& span` leaf is annotated. A fix that
/// reached the dev path alone would show up here and nowhere else in this file.
#[test]
fn no_cell_in_this_file_moves_under_dev() {
    assert_eq!(
        css_dev(
            "",
            ":global(.g) {\n\t\twidth: 20px;\n\t\t&:disabled { & :global(i) { color: green; } }\n\t}",
            true
        ),
        "\n\t.g {\n\t\twidth: 20px;\n\t\t&:disabled { & i { color: green; } }\n\t}\n"
    );
    assert_eq!(
        css_dev(
            "",
            ":global(.g) {\n\t\twidth: 20px;\n\t\t&:hover { color: red; & :global(i) { color: blue; } }\n\t}",
            true
        ),
        "\n\t.g {\n\t\twidth: 20px;\n\t\t&:hover { color: red; & i { color: blue; } }\n\t}\n"
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

/// The implicit `&`. A nested rule that never writes one is walked as
/// `& <selector>` (`get_relative_selectors`), so `:where(:global(form))` is global
/// only if the rule it sits in is. Here the intermediate `:not(span > *)` is not,
/// and the leaf stays unused — the cell that separates "every relative selector is
/// global" from "the selector is global", which the corpus found on
/// `svelte/tests/migrate/samples/is-not-where-has/output.svelte`.
#[test]
fn a_global_argument_under_a_scoped_intermediate_is_still_unused() {
    let out = css(
        "<div>x</div>",
        "div {\n\t\t:not(span > *) {\n\t\t\t:where(:global(form)) { color: red; }\n\t\t}\n\t}",
    );
    assert_eq!(
        out,
        "\n\t/* (empty) div {\n\t\t:not(span > *) {\n\t\t\t:where(:global(form)) { color: red; }\n\t\t}\n\t}*/\n"
    );
}
