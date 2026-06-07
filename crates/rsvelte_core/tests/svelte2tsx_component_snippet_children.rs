//! Regression test for issue #752 (part 1: spurious `children` prop).
//!
//! Passing only `{#snippet}` blocks (plus whitespace/comments) to a component
//! must NOT synthesize a `children` prop — snippets are implicit props, not
//! default-slot content. Otherwise `--tsgo` reports a false
//! `'children' does not exist in type '$$ComponentProps'`. Mirrors upstream
//! `handleImplicitChildren`, which only fakes a `children` prop when there is
//! a real (non-snippet, non-comment, non-whitespace) default-slot child.
//!
//! NOTE: the second half of #752 — typing `{#snippet row({id})}` parameters
//! from the component's `Snippet<[…]>` prop (currently inferred as `any`) —
//! requires lowering the snippet as an implicit prop and is tracked
//! separately; it is NOT addressed by this test.

use rsvelte_core::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn to_tsx(src: &str) -> String {
    let opts = Svelte2TsxOptions {
        filename: "T.svelte".to_string(),
        is_ts_file: true,
        ..Default::default()
    };
    svelte2tsx(src, opts).expect("svelte2tsx").code
}

const CHILDREN_PROP: &str = "children:() => { return __sveltets_2_any(0); },";

#[test]
fn snippet_only_children_do_not_add_children_prop() {
    let out = to_tsx(
        "<script lang=\"ts\">import List from './List.svelte';</script>\n\
         <List>\n  {#snippet row({ id })}{id}{/snippet}\n</List>",
    );
    assert!(
        !out.contains(CHILDREN_PROP),
        "snippet-only children must not add a `children` prop:\n{out}"
    );
}

#[test]
fn real_default_content_still_adds_children_prop() {
    let out = to_tsx(
        "<script lang=\"ts\">import List from './List.svelte';</script>\n\
         <List>hello</List>",
    );
    assert!(
        out.contains(CHILDREN_PROP),
        "real default-slot content should still add a `children` prop:\n{out}"
    );
}

#[test]
fn mixed_snippet_and_content_adds_children_prop() {
    // A non-snippet child alongside a snippet → still a default-slot child.
    let out = to_tsx(
        "<script lang=\"ts\">import List from './List.svelte';</script>\n\
         <List>text{#snippet row({ id })}{id}{/snippet}</List>",
    );
    assert!(
        out.contains(CHILDREN_PROP),
        "mixed content should still add a `children` prop:\n{out}"
    );
}
