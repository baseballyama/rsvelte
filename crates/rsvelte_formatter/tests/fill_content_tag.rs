//! Prose-fill parity for a breakable content/render tag: when a `{call(…)}` /
//! `{@render call(…)}` in element text overflows, it breaks its own argument
//! block while the following prose word stays glued to the closing `)}` — a
//! `group([RawExpr])` participating in the fill, matching prettier-plugin-svelte's
//! `fill + tag-group + fill` shape (issue #1508).

use rsvelte_formatter::{FormatOptions, JsFormatOptions, LineWidth, format};

fn fmt(src: &str) -> String {
    let opts = FormatOptions {
        js: JsFormatOptions {
            line_width: LineWidth::try_from(80u16).expect("valid line width"),
            ..JsFormatOptions::new()
        },
        ..FormatOptions::default()
    };
    let out = format(src, &opts).expect("format ok");
    out.strip_suffix('\n').map(str::to_string).unwrap_or(out)
}

#[test]
fn expression_tag_breaks_and_glues_trailing_word() {
    let src = "<Blockquote>\n\tWide data (property per series). Pre-processed before passed to LineChart. {format(chartData.length)} data points\n</Blockquote>";
    let out = fmt(src);
    assert_eq!(
        out,
        "<Blockquote>\n  Wide data (property per series). Pre-processed before passed to LineChart. {format(\n    chartData.length,\n  )} data points\n</Blockquote>",
        "got:\n{out}"
    );
}

#[test]
fn render_tag_breaks_and_glues_trailing_word() {
    let src = "<div class=\"text-sm text-surface-content/50 mb-10\">\n\tBrowse {@render scrollingValue(totalVisibleExamples)} examples across {@render scrollingValue(visibleExamples.length)} components\n</div>";
    let out = fmt(src);
    assert_eq!(
        out,
        "<div class=\"text-sm text-surface-content/50 mb-10\">\n  Browse {@render scrollingValue(totalVisibleExamples)} examples across {@render scrollingValue(\n    visibleExamples.length,\n  )} components\n</div>",
        "got:\n{out}"
    );
}

#[test]
fn content_tag_breaks_before_a_following_element() {
    // The breakable path fires for the content tag regardless of what follows —
    // here a `<span>` element, not a prose word. The tag still breaks its args and
    // the element glues to the closing `)}` (no space in the source).
    let src = "<Blockquote>\n\tWide data (property per series). Pre-processed before passed to LineChart. {format(chartData.length)}<span>x</span>\n</Blockquote>";
    let out = fmt(src);
    assert_eq!(
        out,
        "<Blockquote>\n  Wide data (property per series). Pre-processed before passed to LineChart. {format(\n    chartData.length,\n  )}<span>x</span>\n</Blockquote>",
        "got:\n{out}"
    );
}
