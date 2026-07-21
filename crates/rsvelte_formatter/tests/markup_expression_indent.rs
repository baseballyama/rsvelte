//! Markup expression wrapping must match prettier-plugin-svelte (the engine
//! `oxfmt` delegates `.svelte` to). Two rules are exercised here:
//!
//! 1. A **content** expression (`{expr}`, `{@html}`, …) is formatted at indent
//!    0 then spliced at its markup nesting depth. The wrap decision must be
//!    made against the width that remains *after* that indent, and any
//!    continuation lines must be pushed out to the nesting depth — otherwise a
//!    line that fits at column 0 silently overflows once nested, or wraps with
//!    its continuation stuck at column 0.
//! 2. A **block-header** expression (`{#if cond}`, `{#each …}`) is never broken
//!    across lines, regardless of width.

use rsvelte_formatter::{FormatOptions, JsFormatOptions, LineWidth, format};

/// Format at an explicit `line_width` (flyle uses 100; the `JsFormatOptions`
/// default is 80, too narrow for these fixtures).
fn fmt_at_width(src: &str, line_width: u16) -> String {
    let opts = FormatOptions {
        js: JsFormatOptions {
            line_width: LineWidth::try_from(line_width).expect("valid line width"),
            ..JsFormatOptions::new()
        },
        ..FormatOptions::default()
    };
    format(src, &opts).expect("format ok")
}

#[test]
fn content_expression_wraps_with_continuation_at_nesting_depth() {
    // At depth 1 (2-space indent) this ternary clears 100 columns, so it breaks
    // — `{someCondition` stays inline after the `{`, the `?`/`:` arms land at
    // depth 2 (4 spaces). Formatted at column 0 it would "fit" and never break.
    let src = concat!(
        "<div>\n",
        "  {someCondition ? aLongFirstBranchValueGoesHere : aLongSecondBranchValueThatClearlyOverflowsThePrintWidthByALot}\n",
        "</div>\n",
    );
    let expected = concat!(
        "<div>\n",
        "  {someCondition\n",
        "    ? aLongFirstBranchValueGoesHere\n",
        "    : aLongSecondBranchValueThatClearlyOverflowsThePrintWidthByALot}\n",
        "</div>\n",
    );
    assert_eq!(fmt_at_width(src, 100), expected);
}

#[test]
fn content_expression_continuation_scales_with_depth() {
    // One level deeper (inside `{#if}`), the `{` sits at depth 2 (4 spaces) and
    // its continuation at depth 3 (6 spaces) — the narrowing and re-indent both
    // track the nesting level.
    let src = concat!(
        "<div>\n",
        "  {#if show}\n",
        "    {someCondition ? aFirstBranchValueGoesHere : aSecondBranchValueThatClearlyOverflowsThePrintWidthByALot}\n",
        "  {/if}\n",
        "</div>\n",
    );
    let expected = concat!(
        "<div>\n",
        "  {#if show}\n",
        "    {someCondition\n",
        "      ? aFirstBranchValueGoesHere\n",
        "      : aSecondBranchValueThatClearlyOverflowsThePrintWidthByALot}\n",
        "  {/if}\n",
        "</div>\n",
    );
    assert_eq!(fmt_at_width(src, 100), expected);
}

#[test]
fn content_expression_under_width_stays_inline() {
    // Comfortably under 100 at depth 1 — no break.
    let src = concat!(
        "<div>\n",
        "  {someCondition ? firstValue : secondValue}\n",
        "</div>\n"
    );
    assert_eq!(fmt_at_width(src, 100), src);
}

#[test]
fn block_header_if_condition_stays_inline_over_width() {
    // 113 columns wide — prettier-plugin-svelte keeps a block tag's expression
    // on one line regardless. A naive width-based printer would break each
    // `&&`; the block-header path must force a single line.
    let src = concat!(
        "{#if alphaCondition && betaCondition && gammaCondition && deltaCondition && epsilonCondition && zetaConditionHere}\n",
        "  <span>x</span>\n",
        "{/if}\n",
    );
    assert_eq!(fmt_at_width(src, 100), src);
}

#[test]
fn content_expression_wrap_is_idempotent() {
    let src = concat!(
        "<div>\n",
        "  {someCondition ? aLongFirstBranchValueGoesHere : aLongSecondBranchValueThatClearlyOverflowsThePrintWidthByALot}\n",
        "</div>\n",
    );
    let once = fmt_at_width(src, 100);
    let twice = fmt_at_width(&once, 100);
    assert_eq!(
        once, twice,
        "wrapped content expression not idempotent:\n{once}"
    );
}

// An attribute value made of TWO wrapped interpolations separated by structural
// whitespace (`style:x="{ternary}\n  {ternary}"`) must open the second
// interpolation at the attribute indent, not double-indented against the source
// whitespace. Regression guard for the Cluster 7 nested-ternary reindent bug.
#[test]
fn multi_interpolation_value_second_opens_at_attr_indent() {
    let src = concat!(
        "<div\n",
        "  style:transform-origin=\"{verticalAnchor === 'middle'\n",
        "    ? 'center'\n",
        "    : verticalAnchor === 'end'\n",
        "      ? 'bottom'\n",
        "      : 'top'}\n",
        "  {textAnchor === 'middle' ? 'center' : textAnchor === 'end' ? 'right' : 'left'}\"\n",
        ">x</div>\n",
    );
    let expected = concat!(
        "<div\n",
        "  style:transform-origin=\"{verticalAnchor === 'middle'\n",
        "    ? 'center'\n",
        "    : verticalAnchor === 'end'\n",
        "      ? 'bottom'\n",
        "      : 'top'}\n",
        "  {textAnchor === 'middle'\n",
        "    ? 'center'\n",
        "    : textAnchor === 'end'\n",
        "      ? 'right'\n",
        "      : 'left'}\"\n",
        ">\n",
        "  x\n",
        "</div>\n",
    );
    let once = fmt_at_width(src, 80);
    assert_eq!(once, expected, "multi-interpolation value indent:\n{once}");
    let twice = fmt_at_width(&once, 80);
    assert_eq!(once, twice, "not idempotent:\n{once}");
}
