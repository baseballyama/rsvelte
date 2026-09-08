//! `<!-- svelte-ignore ownership_invalid_mutation -->` reaches a `bind:` setter
//! on an element and on the block enclosing it, does NOT reach a component
//! binding (upstream's `shared/component.js` builds that assignment with a bare
//! `b.assignment` and never registers it in `ignore_map`), and DOES reach a
//! special element (`ignore_map.set` is per node, not per node kind).
//!
//! Every expectation is the official compiler's own answer at `svelte@5.57.0`,
//! `generate: 'client'`, `dev: true` — not a prediction. The `plain` column is
//! the live control: with no comment every row must emit the validator, so a
//! build that stopped emitting it entirely cannot pass.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// `(name, markup, validated under the ignore comment, validated without it)`.
const CELLS: &[(&str, &str, bool, bool)] = &[
    (
        "element",
        "<input bind:value={item.heading} />",
        false,
        true,
    ),
    (
        "each",
        "{#each [1] as i}<input bind:value={item.heading} />{/each}",
        false,
        true,
    ),
    (
        "if",
        "{#if true}<input bind:value={item.heading} />{/if}",
        false,
        true,
    ),
    ("bind_this", "<div bind:this={item.el}></div>", true, true),
    (
        "svelte_el",
        "<svelte:element this={'div'} bind:this={item.el}></svelte:element>",
        true,
        true,
    ),
    ("component", "<Child bind:value={item.x} />", true, true),
    (
        "win",
        "<svelte:window bind:scrollY={item.y} />",
        false,
        true,
    ),
    (
        "doc",
        "<svelte:document bind:activeElement={item.el} />",
        false,
        true,
    ),
    (
        "body",
        "<svelte:body bind:clientWidth={item.w} />",
        false,
        true,
    ),
];

fn validates(markup: &str, ignore: bool) -> bool {
    let comment = if ignore {
        "<!-- svelte-ignore ownership_invalid_mutation -->\n"
    } else {
        ""
    };
    let src = format!(
        "<script>let {{ item }} = $props();\nimport Child from './Child.svelte';</script>\n{comment}{markup}"
    );
    compile(
        &src,
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .unwrap_or_else(|e| panic!("compile failed: {e:?}"))
    .js
    .code
    .contains("$$ownership_validator.mutation(")
}

#[test]
fn every_cell_matches_the_official_compiler() {
    for (name, markup, ignored, plain) in CELLS {
        assert_eq!(
            validates(markup, true),
            *ignored,
            "{name}: under the ignore comment"
        );
        assert_eq!(
            validates(markup, false),
            *plain,
            "{name}: without the comment"
        );
    }
}

/// The grid is only evidence about suppression if the ignore column holds both
/// answers: a build that never suppresses and one that always does are both
/// caught here, and neither is visible from a column that is all one value.
#[test]
fn the_ignore_column_holds_both_answers() {
    assert!(
        CELLS.iter().any(|c| c.2),
        "no cell is validated under the comment"
    );
    assert!(
        CELLS.iter().any(|c| !c.2),
        "no cell is suppressed by the comment"
    );
    assert!(
        CELLS.iter().all(|c| c.3),
        "every cell must validate without the comment"
    );
}
