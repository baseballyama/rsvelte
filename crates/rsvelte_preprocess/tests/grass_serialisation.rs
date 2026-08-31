//! What `grass` 0.13.4 emits where dart-sass 1.103.1 emits something else.
//!
//! `scss-known-failures.json` lists 315 units, and `compatibility/GATES.md#deliberate-divergences`
//! decides that the render-neutral ones stay listed rather than being normalised away. That
//! decision is only enforceable if the behaviour it describes is pinned: each case below
//! records dart-sass's output beside the assertion, so a `grass` upgrade that converges (or
//! that moves a case from one class to another) fails here and the document gets re-read.
#![cfg(feature = "sass")]

use rsvelte_core::compiler::preprocess::types::{AttributeValue, PreprocessAttributeMap as Map};
use rsvelte_preprocess::filter::FilterOptions;
use rsvelte_preprocess::sass::{SassOptions, preprocess_sass};

fn scss(src: &str) -> String {
    let mut attrs = Map::default();
    attrs.insert(
        "lang".to_string(),
        AttributeValue::String("scss".to_string()),
    );
    preprocess_sass(
        &SassOptions::default(),
        &FilterOptions::default(),
        Some("./src/App.svelte"),
        src,
        &attrs,
    )
    .expect("compiles")
    .expect("not filtered out")
    .code
}

/// dart-sass: `color: rgb(91.3333333333%, 91.3333333333%, 91.3333333333%)`.
/// Same colour once each channel is rounded to 8 bits, which is what the classifier folds to.
#[test]
fn a_computed_colour_prints_in_the_legacy_shortest_form() {
    assert_eq!(
        scss("@use 'sass:color';\na { color: color.adjust(#eee, $lightness: -2%); }"),
        "a {\n  color: #e9e9e9;\n}"
    );
    // dart-sass: `color: rgb(100%, 41.3333333333%, 20%)` — 105.4 against 105 on the green channel.
    assert_eq!(
        scss("a { color: lighten(#f40, 10%); }"),
        "a {\n  color: #ff6933;\n}"
    );
}

/// dart-sass keeps the comment on the declaration's own line; `grass` moves it to the next.
#[test]
fn a_trailing_comment_moves_to_its_own_line() {
    assert_eq!(
        scss("a { color: red; /* keep */ }"),
        "a {\n  color: red;\n  /* keep */\n}"
    );
}

/// dart-sass indents every line of a wrapped selector list to the block; `grass` indents the first.
#[test]
fn a_wrapped_selector_list_inside_media_loses_its_indentation() {
    assert_eq!(
        scss("@media (min-width: 1px) {\n  a,\n  b {\n    color: red;\n  }\n}"),
        "@media (min-width: 1px) {\n  a,\nb {\n    color: red;\n  }\n}"
    );
}

/// Not render-neutral — this one changes the cascade.
/// dart-sass (since 1.77, the `mixed-decls` change): `.b a { color: red; }` then `.b { background: none; }`.
/// Reported in `upstream_issues/grass-hoists-a-declaration-written-after-a-nested-rule.md`.
#[test]
fn a_declaration_after_a_nested_rule_is_hoisted() {
    assert_eq!(
        scss(".b { a { color: red; } background: none; }"),
        ".b {\n  background: none;\n}\n.b a {\n  color: red;\n}"
    );
}

/// Not render-neutral — `0.4` is not a valid `grid-row`, so the browser drops the declaration.
/// Reported in `upstream_issues/grass-slash-list-divided-inside-a-nested-rule.md`.
#[test]
fn a_nested_not_makes_every_later_slash_divide() {
    // dart-sass emits `grid-row: 2/5` in all four. The leak outlives the rule that
    // triggered it, so a pin on the trigger alone would not see three of them.
    assert_eq!(
        scss(".p { .q:not(.r) { grid-row: 2/5; } }"),
        ".p .q:not(.r) {\n  grid-row: 0.4;\n}"
    );
    assert_eq!(
        scss(".p { .q:not(.r) { color: red; } .s { grid-row: 2/5; } }"),
        ".p .q:not(.r) {\n  color: red;\n}\n.p .s {\n  grid-row: 0.4;\n}"
    );
    assert_eq!(
        scss(".p { .q:not(.r) { color: red; } grid-row: 2/5; }"),
        ".p {\n  grid-row: 0.4;\n}\n.p .q:not(.r) {\n  color: red;\n}"
    );
    assert_eq!(
        scss(".p { .q:not(.r) { color: red; } }\n.s { grid-row: 2/5; }"),
        ".p .q:not(.r) {\n  color: red;\n}\n\n.s {\n  grid-row: 0.4;\n}"
    );
}

/// The trigger is the Sass `not` KEYWORD followed by `(`, in the one position where the
/// parser must try a declaration first. Every row here agrees with dart-sass, and each
/// removes exactly one of the two conditions — without them the pin above passes on a
/// build where only `:not` is special-cased, or only nesting is.
#[test]
fn the_slash_survives_without_the_not_keyword_or_without_the_nesting() {
    for source in [
        ".p { .q { grid-row: 2/5; } }",
        ".p { .q:nots(.r) { grid-row: 2/5; } }",
        ".p { .q:xnot(.r) { grid-row: 2/5; } }",
        ".p { .q:is(.r) { grid-row: 2/5; } }",
        ".p { .q:and(.r) { grid-row: 2/5; } }",
        ".p { .q:not { grid-row: 2/5; } }",
    ] {
        assert!(scss(source).contains("grid-row: 2/5"), "divided: {source}");
    }
    // At the top level a declaration is illegal, so the ambiguity never arises.
    assert_eq!(
        scss(".q:not(.r) { color: red; }\n.s { grid-row: 2/5; }"),
        ".q:not(.r) {\n  color: red;\n}\n\n.s {\n  grid-row: 2/5;\n}"
    );
}

/// Neither neighbouring case is part of the defect: both compilers divide here, so a pin
/// built on either would report agreement as a bug.
#[test]
fn a_variable_operand_and_calc_divide_on_both_sides() {
    assert_eq!(
        scss("$n: 2;\na { grid-row: $n/5; }"),
        "a {\n  grid-row: 0.4;\n}"
    );
    assert_eq!(
        scss(".p { .q:not(.r) { grid-row: calc(2/5); } }"),
        ".p .q:not(.r) {\n  grid-row: 0.4;\n}"
    );
}
