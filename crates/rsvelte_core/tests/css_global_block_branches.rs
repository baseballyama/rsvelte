//! Upstream answers "is this rule a global block" with one predicate —
//! `metadata.is_global_block`, set by `is_global_block_selector` for a bare
//! `:global` in the first position of any compound (`css-analyze.js:24-30`,
//! `:222`). rsvelte splits that across four predicates, no two of which agree,
//! and three separate decisions read one that is narrower than upstream's:
//!
//! - `is_rule_empty` had no counterpart for `is_empty`'s opening short-circuit
//!   (`3-transform/css/index.js:432`), so a rule that IS a global block was
//!   judged empty from its children instead of from `children.length === 0`;
//! - `collect_keyframe_names_from_node` asked `is_global_block`, which is true
//!   only for a LONE `:global`, so under `.x :global { … }` an `animation`
//!   reference was hashed while its `@keyframes` was not — output that parses
//!   and names a keyframe nothing defines;
//! - `transform_complex_selector` returned the selector's source verbatim inside
//!   a bare global block, skipping `remove_global_pseudo_class` along with the
//!   scoping modifier, where upstream skips only the modifier.
//!
//! Every expectation is the official compiler's own output for the same source,
//! with the scope hash replaced by `HASH`.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn css(style: &str) -> String {
    let source = format!("<b class=\"x\">y</b>\n<style>\n\t{style}\n</style>\n");
    let out = compile(
        &source,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .unwrap_or_else(|err| panic!("{style}: {err:?}"))
    .css
    .map(|c| c.code)
    .unwrap_or_default();
    let mut result = out;
    while let Some(start) = result.find("svelte-") {
        let len = result[start..]
            .char_indices()
            .find(|(i, c)| *i > 0 && !c.is_ascii_alphanumeric() && *c != '-')
            .map_or(result.len() - start, |(i, _)| i);
        result.replace_range(start..start + len, "HASH");
    }
    result
}

/// A nested `:global(...)` loses its wrapper inside a bare global block too. The
/// lone-`:global` row is the control: that path already unwrapped, which is why
/// only the descendant position diverged.
#[test]
fn a_nested_global_is_unwrapped_in_both_global_block_positions() {
    assert_eq!(
        css(".x :global {\n\t\t.g { & :global(i) { color: green; } }\n\t}"),
        "\n\t.x.HASH {\n\t\t.g { & i { color: green; } }\n\t}\n"
    );
    assert_eq!(
        css(":global {\n\t\t.g { & :global(i) { color: green; } }\n\t}"),
        "\n\t/* :global {*/\n\t\t.g { & i { color: green; } }\n\t/*}*/\n"
    );
}

/// The unwrapping is driven by the selector's own `:global` nodes, not by the
/// text `:global(`. An attribute value spelling it is the decoy, and the real
/// `:global(i)` beside it is what keeps this from passing on a no-op.
#[test]
fn the_unwrapping_reads_selector_nodes_and_not_the_text_global() {
    assert_eq!(
        css(".x :global {\n\t\t.a[data-t=\":global(z)\"] :global(i) { color: red; }\n\t}"),
        "\n\t.x.HASH {\n\t\t.a[data-t=\":global(z)\"] i { color: red; }\n\t}\n"
    );
}

/// An `animation` reference and its `@keyframes` must agree about whether they
/// are inside a global block. The lone-`:global` row is the control: both
/// predicates answer the same there, which is why only the descendant form
/// emitted a reference to a name nothing defines.
#[test]
fn an_animation_reference_and_its_keyframes_agree_in_both_positions() {
    assert_eq!(
        css(
            ".x :global {\n\t\t.g { animation: kf 1s; }\n\t\t@keyframes kf { from { opacity: 0; } }\n\t}"
        ),
        "\n\t.x.HASH {\n\t\t.g { animation: kf 1s; }\n\t\t@keyframes kf { from { opacity: 0; } }\n\t}\n"
    );
    assert_eq!(
        css(
            ":global {\n\t\t.g { animation: kf 1s; }\n\t\t@keyframes kf { from { opacity: 0; } }\n\t}"
        ),
        "\n\t/* :global {*/\n\t\t.g { animation: kf 1s; }\n\t\t@keyframes kf { from { opacity: 0; } }\n\t/*}*/\n"
    );
}

/// A rule that IS a global block is empty only when it has no children at all,
/// so the empty verdict lands on the child. The declaration row is the shape that
/// hid this: with it the intermediate rule is non-empty on its own and the child
/// reaches the ordinary path, which already answered correctly.
#[test]
fn a_global_block_is_empty_only_when_it_has_no_children() {
    assert_eq!(
        css(".x :global {\n\t\t.g { &:disabled { } }\n\t}"),
        "\n\t.x.HASH {\n\t\t/* (empty) .g { &:disabled { } }*/\n\t}\n"
    );
    assert_eq!(
        css(".x :global {\n\t\t.g { height: 20px; &:disabled { } }\n\t}"),
        "\n\t.x.HASH {\n\t\t.g { height: 20px; /* (empty) &:disabled { }*/ }\n\t}\n"
    );
}

/// Only a LONE `:global` has its prelude commented out; a descendant one is an
/// ordinary rule whose subject is still scoped. This is the row that rejects
/// answering every one of the decisions above with the widest predicate.
#[test]
fn a_descendant_global_block_keeps_its_prelude_and_its_scope() {
    assert_eq!(
        css(".x :global {\n\t\t.a { color: red; }\n\t}"),
        "\n\t.x.HASH {\n\t\t.a { color: red; }\n\t}\n"
    );
}
