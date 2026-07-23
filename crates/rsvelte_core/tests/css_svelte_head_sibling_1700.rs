//! Regression tests for issue #1700 — sibling-combinator rules were wrongly
//! pruned when a `<svelte:head>` contained a void element (`<meta>` / `<link>`)
//! and the matching elements came from an `{#each}` block.
//!
//! Root cause: `control_flow::collect_elements_and_paths` assigned `dom_idx`
//! with its own counter but did not descend into `<svelte:head>` (and the other
//! `svelte:*` wrappers), while the analysis visitor that builds
//! `dom_structure.elements` does. A scopable element inside such a wrapper
//! shifted every later element's sibling data, so the each-block element's
//! wrap-around previous sibling was recorded under the wrong index and the
//! `.a + .a` rule found no match. `<title>` alone does not trigger it because a
//! `TitleElement` is not a scopable element.

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

const SCRIPT: &str = "<script>let items = [1, 2];</script>\n";
const EACH: &str = "<section>{#each items as i}<p class=\"a\">{i}</p>{/each}</section>\n";

fn component(head: &str, body: &str, style: &str) -> String {
    format!("{SCRIPT}{head}{body}<style>{style}</style>")
}

fn assert_kept(src: &str, needle: &str) {
    let out = css(src);
    assert!(!out.contains("(unused)"), "rule must be kept, got:\n{out}");
    assert!(
        out.contains(needle),
        "expected scoped `{needle}` in:\n{out}"
    );
}

#[test]
fn void_head_meta_keeps_adjacent_sibling() {
    let src = component(
        "<svelte:head><meta name=\"viewport\" content=\"x\" /></svelte:head>\n",
        EACH,
        ".a + .a { color: red; }",
    );
    assert_kept(&src, "+ .a");
}

#[test]
fn void_head_meta_keeps_general_sibling() {
    let src = component(
        "<svelte:head><meta name=\"viewport\" content=\"x\" /></svelte:head>\n",
        EACH,
        ".a ~ .a { color: red; }",
    );
    assert_kept(&src, "~ .a");
}

#[test]
fn void_head_meta_keeps_type_sibling() {
    let src = component(
        "<svelte:head><meta name=\"viewport\" content=\"x\" /></svelte:head>\n",
        EACH,
        "p + p { color: red; }",
    );
    assert_kept(&src, "+ p");
}

#[test]
fn void_head_link_keeps_adjacent_sibling() {
    let src = component(
        "<svelte:head><link rel=\"icon\" href=\"x\" /></svelte:head>\n",
        EACH,
        ".a + .a { color: red; }",
    );
    assert_kept(&src, "+ .a");
}

#[test]
fn title_only_head_keeps_sibling() {
    let src = component(
        "<svelte:head><title>hi</title></svelte:head>\n",
        EACH,
        ".a + .a { color: red; }",
    );
    assert_kept(&src, "+ .a");
}

#[test]
fn no_head_keeps_sibling() {
    let src = component("", EACH, ".a + .a { color: red; }");
    assert_kept(&src, "+ .a");
}

#[test]
fn void_head_literal_siblings_kept() {
    let src = component(
        "<svelte:head><meta name=\"viewport\" content=\"x\" /></svelte:head>\n",
        "<p class=\"a\">1</p><p class=\"a\">2</p>\n",
        ".a + .a { color: red; }",
    );
    assert_kept(&src, "+ .a");
}

#[test]
fn void_head_child_combinator_kept() {
    let src = component(
        "<svelte:head><meta name=\"viewport\" content=\"x\" /></svelte:head>\n",
        EACH,
        "section > .a { color: red; }",
    );
    assert_kept(&src, "> .a");
}

#[test]
fn void_head_genuinely_unused_still_pruned() {
    // `.a + .b` has no matching `.b`; upstream still prunes it. Guards against
    // the fix over-relaxing sibling pruning.
    let src = component(
        "<svelte:head><meta name=\"viewport\" content=\"x\" /></svelte:head>\n",
        EACH,
        ".a + .b { color: red; }",
    );
    let out = css(&src);
    assert!(
        out.contains("(unused)"),
        "genuinely unused `.a + .b` must be pruned, got:\n{out}"
    );
}
