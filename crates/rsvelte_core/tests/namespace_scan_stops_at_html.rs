//! Upstream's `check_nodes_for_namespace` calls `stop()` for an **html**
//! element only (`3-transform/utils.js:374-381`); an svg or mathml element
//! records the namespace and lets the walk carry on, so a later non-empty
//! `Text` can still downgrade it to `maybe_html` — which the caller reads as
//! "undecided" and falls back to the inherited namespace.
//!
//! This port stopped at the FIRST element of either kind, and its doc comment
//! asserted that rule in words. Because an `{#if}` scans `consequent ||
//! alternate` with a short-circuit `||`, an `<svg>` in the consequent returned
//! "stop" and the alternate was never scanned, so a component-plus-text branch
//! after an svg branch was templated with `$.from_svg`.
//!
//! Six of the eight rows below already agreed before the change: order, host
//! block and the presence of the text each move a cell on their own, so a fix
//! that repairs the two and breaks any of the six is distinguishable from one
//! that does not.
//!
//! Every expected shape was taken from the official Svelte compiler
//! (`submodules/svelte/packages/svelte/src/compiler/index.js`).

use rsvelte_core::compiler::CompileOptions;
use rsvelte_core::{GenerateMode, compile};

/// The `$.from_*` template lines the client emits, in order.
fn template_roots(template: &str) -> Vec<String> {
    let src = format!("<script>import C from './C.svelte'; let a=1,b=2;</script>\n{template}\n");
    let js = compile(
        &src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    js.lines()
        .map(str::trim)
        .filter(|l| {
            l.contains("$.from_html(") || l.contains("$.from_svg(") || l.contains("$.from_mathml(")
        })
        .map(str::to_string)
        .collect()
}

#[test]
fn a_branch_after_an_svg_branch_is_still_html() {
    // The two rows the unconditional stop broke: the `<svg>` consequent
    // returned "stop", so the alternate was never scanned and its component
    // plus text was templated as svg.
    for (template, expected) in [
        (
            "{#if a}<svg><g></g></svg>{:else if b}<C /> text{/if}",
            vec![
                "var root = $.from_svg(`<svg><g></g></svg>`);",
                "var root_1 = $.from_html(`<!> text`, 1);",
            ],
        ),
        (
            "{#if a}<svg><g></g></svg>{:else}<C /> text{/if}",
            vec![
                "var root = $.from_svg(`<svg><g></g></svg>`);",
                "var root_1 = $.from_html(`<!> text`, 1);",
            ],
        ),
    ] {
        assert_eq!(template_roots(template), expected, "for `{template}`");
    }
}

#[test]
fn an_svg_branch_with_nothing_to_downgrade_it_stays_svg() {
    // The control for the change itself: without a non-empty `Text` after the
    // component nothing sets `maybe_html`, and without a component there is no
    // second template at all. A fix that simply stopped recording svg would
    // move these.
    for (template, expected) in [
        (
            "{#if a}<svg><g></g></svg>{:else if b}<C />{/if}",
            vec!["var root = $.from_svg(`<svg><g></g></svg>`);"],
        ),
        (
            "{#if a}<svg><g></g></svg>{:else if b}text{/if}",
            vec!["var root = $.from_svg(`<svg><g></g></svg>`);"],
        ),
    ] {
        assert_eq!(template_roots(template), expected, "for `{template}`");
    }
}

#[test]
fn order_and_host_block_each_move_a_cell_on_their_own() {
    // Three controls that were already right: a sibling of the `{#if}`, the
    // same two branches in the opposite order, and an `{#each}` host. Each
    // reaches the same scan by a different route.
    for (template, expected) in [
        (
            "{#if a}<svg><g></g></svg>{/if}<C /> text",
            vec![
                "var root = $.from_svg(`<svg><g></g></svg>`);",
                "var root_1 = $.from_html(`<!><!> text`, 1);",
            ],
        ),
        (
            "{#if a}<C /> text{:else if b}<svg><g></g></svg>{/if}",
            vec![
                "var root = $.from_html(`<!> text`, 1);",
                "var root_1 = $.from_svg(`<svg><g></g></svg>`);",
            ],
        ),
        (
            "{#if a}<svg><g></g></svg>{/if}{#each [1] as z}<C /> t{/each}",
            vec![
                "var root = $.from_svg(`<svg><g></g></svg>`);",
                "var root_1 = $.from_html(`<!> t`, 1);",
                "var root_2 = $.from_html(`<!><!>`, 1);",
            ],
        ),
    ] {
        assert_eq!(template_roots(template), expected, "for `{template}`");
    }
}

#[test]
fn an_html_element_still_stops_the_scan() {
    // The half of the rule that must NOT change: an html element sets `html`
    // and stops, which is the only `stop()` upstream performs.
    assert_eq!(
        template_roots("{#if a}<i></i>{:else if b}<C /> text{/if}"),
        vec![
            "var root = $.from_html(`<i></i>`);",
            "var root_1 = $.from_html(`<!> text`, 1);",
        ]
    );
}
