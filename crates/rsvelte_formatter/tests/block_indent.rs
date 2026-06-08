//! Block-children indentation, matching prettier-plugin-svelte. The headline
//! case: `{:else if}` branches stay at the same depth as the opening `{#if}`
//! (svelte desugars them into `elseif` IfBlocks nested in the alternate),
//! whereas a plain `{:else}` whose body is an `{#if}` is a genuine nested block
//! and indents one level deeper.

use rsvelte_formatter::{FormatOptions, format};

fn fmt(src: &str) -> String {
    format(src, &FormatOptions::default()).expect("format ok")
}

#[test]
fn else_if_chain_does_not_nest_per_branch() {
    // `<X>`, `<Y>` and `<Z>` all sit at the same depth; before the fix each
    // `{:else if}` / `{:else}` branch gained an extra indent level.
    let src = concat!(
        "<nav>\n",
        "  {#if a}\n",
        "    <X />\n",
        "  {:else if b}\n",
        "    <Y />\n",
        "  {:else}\n",
        "    <Z />\n",
        "  {/if}\n",
        "</nav>\n",
    );
    assert_eq!(
        fmt(src),
        src,
        "else-if branches must not gain an indent level each"
    );
}

#[test]
fn else_if_branch_open_tag_at_branch_depth() {
    // The open-tag (markup.rs) path must also keep `{:else if}` branch elements
    // at the branch depth, not one level deeper.
    let src = concat!(
        "{#if a}\n",
        "  <Comp x={1} />\n",
        "{:else if b}\n",
        "  <Comp first={1} second={2} third={3} fourth={4} />\n",
        "{/if}\n",
    );
    assert_eq!(fmt(src), src, "else-if branch element mis-indented");
}

#[test]
fn plain_else_nested_if_indents_one_level_deeper() {
    // A plain `{:else}` whose body is an `{#if}` is NOT an else-if chain (its
    // alternate fragment carries whitespace and `elseif == false`), so the
    // nested `{#if}` indents one level deeper, as prettier does.
    let src = concat!(
        "{#if a}\n",
        "  <X />\n",
        "{:else}\n",
        "  {#if b}\n",
        "    <Y />\n",
        "  {/if}\n",
        "{/if}\n",
    );
    assert_eq!(fmt(src), src, "plain else nested-if mis-indented");
}

#[test]
fn else_if_chain_is_idempotent() {
    let src = concat!(
        "{#if a}\n",
        "  <X />\n",
        "{:else if b}\n",
        "  <Y />\n",
        "{:else if c}\n",
        "  <Z />\n",
        "{/if}\n",
    );
    let once = fmt(src);
    let twice = fmt(&once);
    assert_eq!(once, twice, "else-if indentation not idempotent:\n{once}");
}
