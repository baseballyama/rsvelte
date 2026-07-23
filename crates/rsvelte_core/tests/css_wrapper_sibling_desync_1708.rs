//! Positive desync regression tests for issue #1700's fix (#1708).
//!
//! `control_flow::collect_elements_and_paths` must descend into the `svelte:*`
//! wrapper nodes so its `dom_idx` counter stays in step with the analysis
//! visitor that builds `dom_structure.elements`. A scopable element inside such
//! a wrapper that the counter fails to descend into shifts every later element's
//! sibling data by one, wrongly pruning a following sibling-combinator rule.
//!
//! #1708 added wrapper match arms for `SvelteHead` / `SvelteFragment` /
//! `SvelteBoundary` / `SvelteSelf` / `SvelteComponent` (and the passthrough
//! `SvelteBody` / `SvelteWindow` / `SvelteDocument`), but only `<svelte:head>`
//! had a positive test. These cover the remaining wrappers that can carry a
//! scopable child: a `<b class="x">` inside each wrapper precedes an `{#each}`
//! group whose wrap-around generates the adjacent `.a` pair, so a one-off
//! `dom_idx` desync would drop the `.a + .a` rule.

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

const SCRIPT: &str = "<script>let items = [1, 2]; let cond = true;</script>\n";
// `{#each}` over adjacent `.a` elements: the wrap-around makes each iteration's
// `.a` a previous sibling of the next, so `.a + .a` matches.
const EACH: &str = "<section>{#each items as i}<p class=\"a\">{i}</p>{/each}</section>\n";
const STYLE: &str = "<style>.a + .a { color: red; }</style>";

fn assert_kept(src: &str) {
    let out = css(src);
    assert!(!out.contains("(unused)"), "rule must be kept, got:\n{out}");
    assert!(!out.contains("(empty)"), "rule must be kept, got:\n{out}");
    assert!(out.contains("+ .a"), "expected scoped `+ .a` in:\n{out}");
}

#[test]
fn svelte_boundary_scopable_child_keeps_sibling() {
    let src = format!(
        "{SCRIPT}<svelte:boundary><b class=\"x\"></b></svelte:boundary>\n{EACH}{STYLE}"
    );
    assert_kept(&src);
}

#[test]
fn svelte_component_scopable_child_keeps_sibling() {
    let src = format!(
        "{SCRIPT}<svelte:component this={{cond}}><b class=\"x\"></b></svelte:component>\n{EACH}{STYLE}"
    );
    assert_kept(&src);
}

#[test]
fn svelte_self_scopable_child_keeps_sibling() {
    // `<svelte:self>` must live inside a block; the guard keeps it finite.
    let src = format!(
        "{SCRIPT}{{#if cond}}<svelte:self><b class=\"x\"></b></svelte:self>{{/if}}\n{EACH}{STYLE}"
    );
    assert_kept(&src);
}

#[test]
fn svelte_fragment_scopable_child_keeps_sibling() {
    // `<svelte:fragment>` must be a direct child of a component.
    let src = format!(
        "{SCRIPT}<Comp><svelte:fragment slot=\"s\"><b class=\"x\"></b></svelte:fragment></Comp>\n{EACH}{STYLE}"
    );
    assert_kept(&src);
}

#[test]
fn svelte_boundary_genuinely_unused_still_pruned() {
    // Guards against the wrapper descent over-relaxing pruning: `.a + .b` has no
    // matching `.b`, so upstream still prunes it.
    let src = format!(
        "{SCRIPT}<svelte:boundary><b class=\"x\"></b></svelte:boundary>\n{EACH}<style>.a + .b {{ color: red; }}</style>"
    );
    let out = css(&src);
    assert!(
        out.contains("(unused)"),
        "genuinely unused `.a + .b` must be pruned, got:\n{out}"
    );
}
