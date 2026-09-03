//! Upstream reads a **reassigned** each item as `collection[$index]` and never
//! as `$.get(item)` (`EachBlock.js:216-227`), and rsvelte ports that rule as
//! `build_reassigned_item_read`. The rule is applied at eight sites — and the
//! dependency list an inner `bind:` hands to `$.invalidate_inner_signals` is a
//! ninth, built by a string loop that consults `state.transform` directly, so
//! it never saw it.
//!
//! Which reads move is the axis, not which block: every other read of `item` in
//! the same output was already correct, so a grid over each-block *shapes* with
//! one read per cell would be green. The cells below therefore fix the shape
//! and vary whether the item is reassigned, plus a three-level cell where the
//! collection expression is itself a read of an outer item — the only one that
//! separates "substitute the item" from "substitute the whole read".
//!
//! Every expected string was taken from the official Svelte compiler
//! (`submodules/svelte/packages/svelte/src/compiler/index.js`), not inferred
//! from rsvelte's output.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn invalidate_calls(template: &str, dev: bool) -> Vec<String> {
    let src = format!(
        "<script>\n\timport C from './C.svelte';\n\timport D from './D.svelte';\n\tlet items = [];\n</script>\n{template}\n"
    );
    let js = compile(
        &src,
        CompileOptions {
            filename: Some("M.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    js.lines()
        .map(str::trim)
        .filter(|l| l.starts_with("$.invalidate_inner_signals("))
        .map(str::to_string)
        .collect()
}

/// `(name, template, official's `invalidate_inner_signals` calls in order)`.
const CELLS: &[(&str, &str, &[&str])] = &[
    (
        "outer item reassigned by bind:",
        "{#each items as item (item.id)}<D bind:item bind:items />{#each item.kids as sub (sub.id)}<C bind:item={sub} bind:items />{/each}{/each}",
        &[
            "$.invalidate_inner_signals(() => ($.get(items)))",
            "$.invalidate_inner_signals(() => ($.get(items)[$$index_1], $.get(items)))",
        ],
    ),
    (
        // The negative half: nothing writes `item`, so upstream keeps the
        // signal read and the fix must not touch this cell.
        "outer item not reassigned",
        "{#each items as item (item.id)}{#each item.kids as sub (sub.id)}<C bind:item={sub} bind:items />{/each}{/each}",
        &["$.invalidate_inner_signals(() => ($.get(item), $.get(items)))"],
    ),
    (
        // `reassigned` is about any write, so an event handler qualifies too;
        // reaching the rule only through `bind:` would pass the cell above.
        "outer item reassigned by an event handler",
        "{#each items as item (item.id)}<button onclick={() => (item = 1)}>x</button>{#each item.kids as sub (sub.id)}<C bind:item={sub} bind:items />{/each}{/each}",
        &[
            "$.invalidate_inner_signals(() => ($.get(items)[$$index_1], $.get(items)))",
            "$.invalidate_inner_signals(() => ($.get(items)))",
        ],
    ),
    (
        "unkeyed outer each, item reassigned",
        "{#each items as item}<D bind:item bind:items />{#each item.kids as sub (sub.id)}<C bind:item={sub} bind:items />{/each}{/each}",
        &[
            "$.invalidate_inner_signals(() => ($.get(items)))",
            "$.invalidate_inner_signals(() => ($.get(items)[$$index_1], $.get(items)))",
        ],
    ),
    (
        // The collection is `a.kids`, a read of the enclosing each's item, so
        // the replacement is the whole `$.get(a).kids[$$index_1]` and not the
        // identifier alone.
        "three levels, middle item reassigned",
        "{#each items as a (a.id)}{#each a.kids as b (b.id)}<D bind:item={b} />{#each b.kids as c (c.id)}<C bind:item={c} bind:items />{/each}{/each}{/each}",
        &[
            "$.invalidate_inner_signals(() => ($.get(a), $.get(items)))",
            "$.invalidate_inner_signals(() => ($.get(a).kids[$$index_1], $.get(items), $.get(a)))",
        ],
    ),
];

#[test]
fn a_reassigned_each_item_is_read_by_index_in_an_invalidation_dependency() {
    // Both directions have to be present, or a rule that rewrote every item —
    // or none — would satisfy the grid.
    assert!(
        CELLS
            .iter()
            .any(|(_, _, want)| want.iter().any(|l| l.contains("$$index_1"))),
        "no cell expects an indexed read"
    );
    assert!(
        CELLS
            .iter()
            .any(|(_, _, want)| want.iter().all(|l| !l.contains("$$index_1"))),
        "no cell expects the signal read to survive"
    );

    for (name, template, want) in CELLS {
        for dev in [false, true] {
            let got = invalidate_calls(template, dev);
            assert_eq!(
                got,
                want.iter().map(|s| s.to_string()).collect::<Vec<_>>(),
                "cell `{name}` (dev = {dev})"
            );
        }
    }
}
