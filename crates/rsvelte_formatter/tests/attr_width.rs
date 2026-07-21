//! Open-tag wrapping uses visual (East Asian) width, matching oxfmt /
//! prettier: a tag that fits in character count but exceeds `printWidth` in
//! display columns — CJK text counts as two columns — must still wrap onto
//! one attribute per line.

use rsvelte_formatter::{FormatOptions, JsFormatOptions, LineWidth, format};

fn fmt(src: &str) -> String {
    format(src, &FormatOptions::default()).expect("format ok")
}

// A CJK description that is < 80 chars but > 80 display columns once the
// fullwidth text is counted as 2 each.
const CJK_TAG: &str = "<Alert pattern=\"info\" description=\"フォームに入力せずに作成した場合、組織名がテナント名になります\" />\n";

#[test]
fn cjk_attribute_wraps_at_print_width() {
    let out = fmt(CJK_TAG);
    assert!(
        out.starts_with("<Alert\n  pattern=\"info\"\n"),
        "CJK-heavy tag should wrap (visual width exceeds printWidth):\n{out}"
    );
    assert!(
        out.contains("\n/>"),
        "self-close should be on its own line:\n{out}"
    );
}

#[test]
fn short_ascii_tag_stays_one_line() {
    let src = "<Alert pattern=\"info\" />\n";
    assert_eq!(fmt(src), src, "short ASCII tag should not wrap");
}

#[test]
fn cjk_width_wrap_is_idempotent() {
    let once = fmt(CJK_TAG);
    let twice = fmt(&once);
    assert_eq!(
        once, twice,
        "CJK width-driven wrap is not idempotent:\n{once}"
    );
}

#[test]
fn class_directive_value_breaks_narrowed_by_its_prefix() {
    // Once the open tag wraps, a `class:NAME={EXPR}` whose full line overflows
    // must break its value where prettier does — the value's wrap budget is
    // narrowed by the `class:NAME=` prefix, matching `style:` / `on:` / `use:`
    // (#795). Without that, the value's own width check (indent only) keeps the
    // 107-column line flat past the 100-column print width.
    let src = "<div\n  role=\"button\"\n  class:template-option-selected={selectedUserDefinedId === templateOption.customPageUserDefinedIdentifier}\n></div>\n";
    let want = "<div\n  role=\"button\"\n  class:template-option-selected={selectedUserDefinedId ===\n    templateOption.customPageUserDefinedIdentifier}\n></div>\n";
    assert_eq!(
        fmt(src),
        want,
        "class directive value not narrowed by prefix"
    );
}

#[test]
fn class_directive_value_that_fits_stays_flat() {
    // A `class:NAME={EXPR}` whose full line fits the print width must NOT break.
    let src = "<div class:active={isActive}></div>\n";
    assert_eq!(fmt(src), src, "short class directive should not wrap");
}

// ── whole-value Doc model: multi-interpolation attribute values ────────────

fn fmt_w(src: &str, width: u16) -> String {
    let opts = FormatOptions {
        js: JsFormatOptions {
            line_width: LineWidth::try_from(width).expect("valid line width"),
            ..JsFormatOptions::new()
        },
        ..FormatOptions::default()
    };
    format(src, &opts).expect("format ok")
}

fn fmt80(src: &str) -> String {
    fmt_w(src, 80)
}

#[test]
fn multi_interp_value_breaks_single_breakable_interpolation() {
    // A quoted value with two interpolations, exactly one of them breakable
    // (the ternary; `{css}` is a bare identifier), routes through the
    // whole-value Doc model: the ternary breaks at its `?`/`:` while `{css}`
    // stays flat on the final line — measured with the full trailing tail,
    // matching prettier-plugin-svelte. (Cluster 2: svar-core Panel shape.)
    let src = "<div class=\"wx-calendar {part !== 'normal' && part !== 'both' ? 'wx-part' : ''} {css}\">x</div>\n";
    let out = fmt80(src);
    assert!(
        out.contains("class=\"wx-calendar {part !== 'normal' && part !== 'both'\n")
            && out.contains("\n    ? 'wx-part'\n    : ''} {css}\""),
        "single breakable interpolation should break at its operator with the trailing `{{css}}` flat:\n{out}"
    );
}

#[test]
fn multi_interp_value_is_idempotent() {
    // Re-parsing the broken output must reproduce the same break (the RawExpr
    // broken form round-trips through the parser identically).
    let src = "<div class=\"wx-calendar {part !== 'normal' && part !== 'both' ? 'wx-part' : ''} {css}\">x</div>\n";
    let once = fmt80(src);
    let twice = fmt80(&once);
    assert_eq!(
        once, twice,
        "multi-interp Doc-model wrap is not idempotent:\n{once}"
    );
}

#[test]
fn multi_interp_transform_breaks_first_binary() {
    // `transform="rotate({A}) translate({B})"` where only the first
    // interpolation is breakable (a binary) and the second is a bare
    // identifier: the first breaks at its operator, everything after stays on
    // the continuation line. (Cluster 2: layerchart Chord/ticks shape.)
    let src = "<g transform=\"rotate({(angle * 180) / Math.PI - 90}) translate({outerRadius}, 0)\"></g>\n";
    let out = fmt_w(src, 72);
    assert!(
        out.contains("transform=\"rotate({(angle * 180) / Math.PI -\n")
            && out.contains("\n    90}) translate({outerRadius}, 0)\""),
        "first breakable interpolation should break at its binary operator:\n{out}"
    );
    let twice = fmt_w(&out, 72);
    assert_eq!(
        out, twice,
        "transform multi-interp wrap is not idempotent:\n{out}"
    );
}

#[test]
fn multi_breakable_value_breaks_first_when_later_cannot_absorb() {
    // Two breakable interpolations (both ternaries): the first is long enough
    // that keeping it flat would overflow before the second could break, so the
    // FIRST breaks and the second stays flat on the continuation line — the
    // whole-value Doc model's `fits` measures a trailing breakable interpolation
    // only up to its first break. (Cluster 2: layerchart Vector.base shape.)
    let src = "<div class=\"lc-vector {isFilled ? 'lc-vector-filled' : 'lc-vector-stroked'} {typeof className === 'string' ? className : ''}\">x</div>\n";
    let out = fmt80(src);
    assert!(
        out.contains("class=\"lc-vector {isFilled\n")
            && out.contains(
                "\n    : 'lc-vector-stroked'} {typeof className === 'string' ? className : ''}\""
            ),
        "first breakable ternary should break, second stays flat:\n{out}"
    );
    let twice = fmt80(&out);
    assert_eq!(out, twice, "multi-breakable wrap is not idempotent:\n{out}");
}

#[test]
fn multi_breakable_value_keeps_first_flat_when_later_absorbs() {
    // A short breakable interpolation followed by a long one: the first stays
    // flat because the later one can break to absorb the overflow (its first
    // break point is reached within the width). Only the later interpolation
    // breaks — the greedy left-to-right layout prettier-plugin-svelte produces.
    let src = "<div class=\"{a[b]} then some filler text here {reallyLongName[anotherLongIndexName]}\">x</div>\n";
    let out = fmt_w(src, 60);
    assert!(
        out.contains("class=\"{a[b]} then some filler text here {reallyLongName[\n"),
        "earlier breakable interpolation should stay flat while the later one breaks:\n{out}"
    );
    let twice = fmt_w(&out, 60);
    assert_eq!(out, twice, "later-absorbs wrap is not idempotent:\n{out}");
}
