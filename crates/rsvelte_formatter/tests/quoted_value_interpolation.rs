//! An expression interpolated into a quoted attribute value is measured at its
//! real column.
//!
//! `render_value_sequence_doc` — the model that formats each interpolation at its
//! running flat column — returned `None` below two interpolations, so a value with
//! exactly one fell to the legacy path, whose `minimal_break_extra` forces only the
//! expression's top-level split. For a ternary that is `?` / `:`, so the test was
//! never re-measured and stayed flat past the width. Measured against the
//! oxfmt(`svelte: true`) oracle at `printWidth: 80`: over the 104 corpus entries
//! whose first divergence is an interpolation inside a quoted value, 0 matched
//! before and 57 match after, with 0 regressions over all 33,776 components.
//!
//! The one reserved column is bracketed by the two tests at the bottom, each
//! reduced from a real regression the wrong constant produced: reserving two
//! columns breaks a first chunk that lands exactly ON the width, reserving none
//! keeps one that lands a column over.

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

const LONG: &str = "relative group rounded-xl overflow-hidden border border-base-300 bg-base-200/30 hover:border-primary transition shadow-sm";
const TERNARY: &str = "coverImageId === image.id ? \"ring-2 ring-primary\" : \"\"";

#[test]
fn a_ternary_interpolated_after_a_long_literal_breaks_its_test() {
    assert_eq!(
        fmt(&format!("<div class=\"{LONG} {{{TERNARY}}}\"></div>\n")),
        "<div\n  class=\"relative group rounded-xl overflow-hidden border border-base-300 bg-base-200/30 hover:border-primary transition shadow-sm {coverImageId ===\n  image.id\n    ? 'ring-2 ring-primary'\n    : ''}\"\n></div>\n"
    );
}

#[test]
fn a_short_literal_prefix_leaves_the_same_ternary_alone() {
    // The control that this is about the prefix's columns and not about the
    // expression: the identical ternary after two columns of literal text fits.
    let src = "<div class=\"a {coverImageId === image.id ? 'ring-2 ring-primary' : ''}\"></div>\n";
    assert_eq!(fmt(src), src);
}

#[test]
fn the_same_ternary_as_the_whole_unquoted_value_is_unchanged() {
    let src = "<div class={coverImageId === image.id ? \"ring-2 ring-primary\" : \"\"}></div>\n";
    assert_eq!(fmt(src), src);
}

#[test]
fn a_non_ternary_after_the_same_long_literal_is_unchanged() {
    // A bare binary in the identical slot was already correct — the divergence
    // needs the ternary, whose top-level split the legacy path stops at.
    assert_eq!(
        fmt(&format!(
            "<div class=\"{LONG} {{coverImageId === image.id}}\"></div>\n"
        )),
        "<div\n  class=\"relative group rounded-xl overflow-hidden border border-base-300 bg-base-200/30 hover:border-primary transition shadow-sm {coverImageId ===\n    image.id}\"\n></div>\n"
    );
}

#[test]
fn a_first_chunk_landing_exactly_on_the_width_stays_whole() {
    // Reserving two columns instead of one breaks this one early.
    let src = "<div>\n<div class=\"antiPanel-navigator {$deviceInfo.navigator.direction === 'horizontal' ? 'portrait' : 'landscape'} border-left\" class:border-right={c}></div>\n</div>\n";
    assert_eq!(
        fmt(src),
        "<div>\n  <div\n    class=\"antiPanel-navigator {$deviceInfo.navigator.direction === 'horizontal'\n      ? 'portrait'\n      : 'landscape'} border-left\"\n    class:border-right={c}\n  ></div>\n</div>\n"
    );
}

#[test]
fn a_first_chunk_one_column_over_the_width_breaks() {
    // Reserving none instead of one keeps this one whole at 81 columns.
    let src = "<div>\n<div>\n<div>\n<div>\n<div>\n<div>\n<div class=\"health-check {results.sanityChecks.orphanedGlue.length === 0 ? 'pass' : 'warn'}\"></div>\n</div>\n</div>\n</div>\n</div>\n</div>\n</div>\n";
    assert_eq!(
        fmt(src),
        "<div>\n  <div>\n    <div>\n      <div>\n        <div>\n          <div>\n            <div\n              class=\"health-check {results.sanityChecks.orphanedGlue.length ===\n              0\n                ? 'pass'\n                : 'warn'}\"\n            ></div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n"
    );
}
