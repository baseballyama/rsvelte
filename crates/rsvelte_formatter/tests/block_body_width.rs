//! A block's closing tag is part of the width its one-line body is measured against.
//!
//! An element's own close tag lies inside its span and is measured with it; a
//! block's `{/if}` does not, so an element that is a block's whole one-line body
//! was judged to fit by exactly the closers' width. Measured against the
//! oxfmt(`svelte: true`) oracle at `printWidth: 80`: before this, rsvelte's break
//! threshold was late by 5 for `{/if}`, 6 for `{/key}`, 7 for `{/each}` and 10
//! for a block nested in a block, and by 0 for every element parent. The scan
//! reads any tag, not only a closer: a block ARM and the tags of that arm sit
//! on the line too (`{:else}{label}{/if}` is 19 columns). It stops at the first
//! thing that is not a tag, because an element carries its own break decision —
//! with a second element there the oracle breaks THAT one and keeps the first
//! flat, so charging its width to the first would be the wrong direction.

use rsvelte_formatter::{FormatOptions, JsFormatOptions, LineWidth, format};

fn fmt(src: &str) -> String {
    let opts = FormatOptions {
        js: JsFormatOptions {
            line_width: LineWidth::try_from(80u16).expect("valid line width"),
            ..JsFormatOptions::default()
        },
        ..FormatOptions::default()
    };
    format(src, &opts).expect("format ok")
}

const EL: &str = "<Icon icon={action.icon} size={\"small\"} klass=\"mr-2 wide\" />";

#[test]
fn an_if_blocks_closer_counts_against_the_body() {
    assert_eq!(
        fmt(&format!("{{#if action.icon}}{EL}{{/if}}\n")),
        "{#if action.icon}<Icon\n    icon={action.icon}\n    size={\"small\"}\n    klass=\"mr-2 wide\"\n  />{/if}\n"
    );
}

#[test]
fn an_each_blocks_closer_counts_against_the_body() {
    assert_eq!(
        // The header is chosen so the element alone lands exactly ON the width
        // (80) and only the closer pushes it over — a longer header would break
        // without this fix and the test would measure nothing.
        fmt(&format!("{{#each rs as action}}{EL}{{/each}}\n")),
        "{#each rs as action}<Icon\n    icon={action.icon}\n    size={\"small\"}\n    klass=\"mr-2 wide\"\n  />{/each}\n"
    );
}

#[test]
fn a_key_blocks_closer_counts_against_the_body() {
    assert_eq!(
        fmt(&format!("{{#key action.i}}{EL}{{/key}}\n")),
        "{#key action.i}<Icon\n    icon={action.icon}\n    size={\"small\"}\n    klass=\"mr-2 wide\"\n  />{/key}\n"
    );
}

#[test]
fn two_nested_blocks_count_both_closers() {
    assert_eq!(
        fmt(
            "{#if a}{#if action.ic}<Icon icon={action.icon} klass=\"mr-2 wide pad\" />{/if}{/if}\n"
        ),
        "{#if a}{#if action.ic}<Icon\n      icon={action.icon}\n      klass=\"mr-2 wide pad\"\n    />{/if}{/if}\n"
    );
}

#[test]
fn a_body_that_still_fits_with_the_closer_is_left_alone() {
    assert_eq!(
        fmt("{#if a}<Icon icon={a.i} />{/if}\n"),
        "{#if a}<Icon icon={a.i} />{/if}\n"
    );
}

#[test]
fn an_element_parent_is_unaffected() {
    // Its close tag is inside its own span and was already measured; this is the
    // control that makes the rule about block closers rather than about trailing
    // content in general.
    assert_eq!(
        fmt(&format!("<span>{EL}</span>\n")),
        "<span><Icon icon={action.icon} size={\"small\"} klass=\"mr-2 wide\" /></span>\n"
    );
}

#[test]
fn a_closer_on_the_close_tags_line_does_not_count() {
    // `</td>{/each}` — the element is already multi-line, so the closer sits on
    // the CLOSE tag's line, not the open tag's. Charging it to the open tag broke
    // one real corpus file (`svelte-ux/.../docs/components/Table/+page.svelte`).
    // The open tag is 75 columns at its indent — inside the width — and the
    // `{/each}` would take it to 82. Nothing may break.
    let src = "{#each cols as column}\n  <td use:tableCell={{ column, rowData, rowIndex, tableData: dataValues }}>\n    {value}\n  </td>{/each}\n";
    assert_eq!(fmt(src), src);
}

const X38: &str = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
const X36: &str = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

#[test]
fn a_block_arm_and_the_tags_after_it_count_too() {
    // `{:else}{label}{/if}` is 19 columns and the scan read only the `{/if}`, so
    // rsvelte's threshold was late by exactly that.
    assert_eq!(
        fmt(&format!(
            "{{#if a}}<Label text=\"{X38}\" />{{:else}}{{label}}{{/if}}\n"
        )),
        format!("{{#if a}}<Label\n    text=\"{X38}\"\n  />{{:else}}{{label}}{{/if}}\n")
    );
}

#[test]
fn one_column_under_that_threshold_stays_flat() {
    // Two characters shorter: the control that the test above measures the
    // trailing tags and not simply "this element is too wide".
    let src = format!("{{#if a}}<Label text=\"{X36}\" />{{:else}}{{label}}{{/if}}\n");
    assert_eq!(fmt(&src), src);
}

#[test]
fn an_expression_tag_after_the_element_counts() {
    // Not a closer and not an arm — a sibling `{…}` on the same flat line. The
    // element alone is 37 columns and nothing about it is over the width.
    assert_eq!(
        fmt(
            "{#if a}<Label text=\"xxxxxxxxxxxxxxxxxxxx\" />{aVeryLongExpressionNameIndeedYes}{/if}\n"
        ),
        "{#if a}<Label\n    text=\"xxxxxxxxxxxxxxxxxxxx\"\n  />{aVeryLongExpressionNameIndeedYes}{/if}\n"
    );
}
