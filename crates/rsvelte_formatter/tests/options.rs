//! prettier-plugin-svelte / oxfmt option support: `singleAttributePerLine`,
//! `svelteAllowShorthand`, `svelteIndentScriptAndStyle`, `svelteSortOrder`, and
//! `bracketSameLine`. Each asserts the non-default value diverges from the
//! default exactly the way oxfmt (`prettier-plugin-svelte`) does. See issue
//! #1057.

use rsvelte_formatter::{
    FormatOptions, IndentWidth, JsFormatOptions, LineWidth, SortOrderSpec, format,
};

fn fmt(src: &str, opts: &FormatOptions) -> String {
    format(src, opts).expect("format ok")
}

// ─── singleAttributePerLine ──────────────────────────────────────────────

#[test]
fn single_attribute_per_line_breaks_multi_attr() {
    let opts = FormatOptions {
        single_attribute_per_line: true,
        ..FormatOptions::default()
    };
    let out = fmt("<div class=\"a\" id=\"b\" role=\"c\"></div>", &opts);
    assert_eq!(
        out,
        "<div\n  class=\"a\"\n  id=\"b\"\n  role=\"c\"\n></div>\n"
    );
}

#[test]
fn single_attribute_per_line_keeps_single_attr_inline() {
    let opts = FormatOptions {
        single_attribute_per_line: true,
        ..FormatOptions::default()
    };
    let out = fmt("<div class=\"a\"></div>", &opts);
    assert_eq!(out, "<div class=\"a\"></div>\n");
}

#[test]
fn single_attribute_per_line_default_off_stays_flat() {
    let out = fmt(
        "<div class=\"a\" id=\"b\" role=\"c\"></div>",
        &FormatOptions::default(),
    );
    assert_eq!(out, "<div class=\"a\" id=\"b\" role=\"c\"></div>\n");
}

// ─── svelteAllowShorthand ────────────────────────────────────────────────

#[test]
fn allow_shorthand_false_expands_attribute_and_directives() {
    let opts = FormatOptions {
        allow_shorthand: false,
        ..FormatOptions::default()
    };
    let out = fmt(
        "<div class:active={active} style:color={color} {foo}></div>",
        &opts,
    );
    assert_eq!(
        out,
        "<div class:active={active} style:color={color} foo={foo}></div>\n"
    );
}

#[test]
fn allow_shorthand_false_expands_bind() {
    let opts = FormatOptions {
        allow_shorthand: false,
        ..FormatOptions::default()
    };
    let out = fmt("<input bind:value={value} />", &opts);
    assert_eq!(out, "<input bind:value={value} />\n");
}

#[test]
fn allow_shorthand_default_collapses() {
    let out = fmt(
        "<div class:active={active} style:color={color} foo={foo}></div>",
        &FormatOptions::default(),
    );
    assert_eq!(out, "<div class:active style:color {foo}></div>\n");
}

// ─── svelteIndentScriptAndStyle ──────────────────────────────────────────

#[test]
fn indent_script_and_style_false_flushes_script_body() {
    let opts = FormatOptions {
        indent_script_and_style: false,
        ..FormatOptions::default()
    };
    let out = fmt("<script>\n  const a = 1;\n</script>", &opts);
    assert_eq!(out, "<script>\nconst a = 1;\n</script>\n");
}

#[test]
fn indent_script_and_style_false_keeps_full_print_width() {
    let opts = FormatOptions {
        js: JsFormatOptions {
            indent_width: IndentWidth::try_from(4).expect("valid indent width"),
            line_width: LineWidth::try_from(100).expect("valid line width"),
            ..JsFormatOptions::default()
        },
        indent_script_and_style: false,
        ..FormatOptions::default()
    };
    let src = r#"<script>
const metrics = $derived.by(() => {
    return {
        recurring_amount:
            overview.recurring_snapshot?.currencies?.[0]?.committed_monthly_equivalent_display ||
            'No recurring base yet',
    }
})
</script>"#;
    let out = fmt(src, &opts);
    assert!(
        out.contains(
            "overview.recurring_snapshot?.currencies?.[0]?.committed_monthly_equivalent_display ||"
        ),
        "script body should retain the full configured line width:\n{out}"
    );
}

#[test]
fn indent_script_and_style_default_indents_script_body() {
    let out = fmt(
        "<script>\nconst a = 1;\n</script>",
        &FormatOptions::default(),
    );
    assert_eq!(out, "<script>\n  const a = 1;\n</script>\n");
}

// ─── svelteSortOrder ─────────────────────────────────────────────────────

#[test]
fn sort_order_styles_before_scripts() {
    let opts = FormatOptions {
        sort_order: SortOrderSpec::parse("styles-scripts-markup-options").expect("valid"),
        ..FormatOptions::default()
    };
    let src = "<script>\n  const a = 1;\n</script>\n\n<div>hi</div>";
    let out = fmt(src, &opts);
    // Styles section is absent here, but the instance script must still print
    // before the markup per the keyword order (scripts < markup).
    assert!(
        out.starts_with("<script>"),
        "scripts should still lead markup:\n{out}"
    );
}

#[test]
fn sort_order_none_keeps_source_order() {
    let opts = FormatOptions {
        sort_order: SortOrderSpec::parse("none").expect("valid"),
        ..FormatOptions::default()
    };
    // Source order: markup, then script. With "none" the script is NOT hoisted
    // above the markup.
    let src = "<div>hi</div>\n\n<script>\n  const a = 1;\n</script>";
    let out = fmt(src, &opts);
    assert!(
        out.starts_with("<div>hi</div>"),
        "markup should stay first under sortOrder none:\n{out}"
    );
}

#[test]
fn sort_order_default_hoists_script_above_markup() {
    let src = "<div>hi</div>\n\n<script>\n  const a = 1;\n</script>";
    let out = fmt(src, &FormatOptions::default());
    assert!(
        out.starts_with("<script>"),
        "default order hoists scripts above markup:\n{out}"
    );
}

// ─── bracketSameLine ─────────────────────────────────────────────────────

#[test]
fn bracket_same_line_glues_self_closing_closer() {
    let opts = FormatOptions {
        single_attribute_per_line: true,
        bracket_same_line: true,
        ..FormatOptions::default()
    };
    let out = fmt("<input class=\"a\" id=\"b\" role=\"c\" />", &opts);
    assert_eq!(out, "<input\n  class=\"a\"\n  id=\"b\"\n  role=\"c\" />\n");
}

#[test]
fn bracket_same_line_default_breaks_self_closing_closer() {
    let opts = FormatOptions {
        single_attribute_per_line: true,
        ..FormatOptions::default()
    };
    let out = fmt("<input class=\"a\" id=\"b\" role=\"c\" />", &opts);
    assert_eq!(out, "<input\n  class=\"a\"\n  id=\"b\"\n  role=\"c\"\n/>\n");
}

#[test]
fn bracket_same_line_glues_non_empty_closer() {
    let opts = FormatOptions {
        single_attribute_per_line: true,
        bracket_same_line: true,
        ..FormatOptions::default()
    };
    let out = fmt("<div class=\"a\" id=\"b\" role=\"c\">hello</div>", &opts);
    assert_eq!(
        out,
        "<div\n  class=\"a\"\n  id=\"b\"\n  role=\"c\">\n  hello\n</div>\n"
    );
}

fn width_80(bracket_same_line: bool) -> FormatOptions {
    FormatOptions {
        js: JsFormatOptions {
            line_width: LineWidth::try_from(80).unwrap(),
            ..JsFormatOptions::default()
        },
        bracket_same_line,
        ..FormatOptions::default()
    }
}

// A wrapped open tag whose first child is an inline `{#if}` block is rebuilt by
// the children-port pass (the `block_run` gate routes `{#if}`-only fragments
// through it); it must still glue the `>` to the last attribute under
// `bracketSameLine`. See issue #1654.
#[test]
fn bracket_same_line_glues_closer_before_if_block() {
    let src = "<div class=\"a-long-class-name-that-overflows-eighty-columns\" id=\"identifier\" data-x=\"value\">\n  {#if cond}\n    <span>hi</span>\n  {/if}\n</div>";
    let out = fmt(src, &width_80(true));
    assert_eq!(
        out,
        "<div\n  class=\"a-long-class-name-that-overflows-eighty-columns\"\n  id=\"identifier\"\n  data-x=\"value\">\n  {#if cond}\n    <span>hi</span>\n  {/if}\n</div>\n"
    );
}

// `{#each}` is NOT routed through the children port (the `block_run` gate only
// admits `{#if}`), so this exercises the markup-path `bracketSameLine` glue in
// `render_multi_line` rather than the port. Kept as a user-facing guard for the
// each-block shape.
#[test]
fn bracket_same_line_glues_closer_before_each_block() {
    let src = "<ul class=\"a-long-class-name-that-overflows-eighty-columns\" id=\"identifier\" data-x=\"value\">\n  {#each items as item}\n    <li>{item}</li>\n  {/each}\n</ul>";
    let out = fmt(src, &width_80(true));
    assert_eq!(
        out,
        "<ul\n  class=\"a-long-class-name-that-overflows-eighty-columns\"\n  id=\"identifier\"\n  data-x=\"value\">\n  {#each items as item}\n    <li>{item}</li>\n  {/each}\n</ul>\n"
    );
}

// A wrapped, source-empty inline element whose closing `>` hugs must not emit a
// spurious blank line under `bracketSameLine`: prettier keeps `…"\n  ></span>`
// (softline before the dedented `>`, then `></span>` glued), applying
// `canOmitSoftlineBeforeClosingTag` when whitespace follows the element.
#[test]
fn bracket_same_line_empty_inline_element_hugs_without_blank_line() {
    let src = "<p>Some prose text <span class=\"a-really-long-class-name-that-forces-the-open-tag-to-wrap-well-past-eighty-columns\"></span> more prose after</p>";
    let out = fmt(src, &width_80(true));
    assert_eq!(
        out,
        "<p>\n  Some prose text <span\n    class=\"a-really-long-class-name-that-forces-the-open-tag-to-wrap-well-past-eighty-columns\"\n  ></span> more prose after\n</p>\n"
    );
}

// When non-whitespace content directly follows the element (no hug of the next
// node, not last child of a block), `canOmitSoftlineBeforeClosingTag` is false, so
// the softline before the closing `>` is kept (`></span\n  >more`).
#[test]
fn bracket_same_line_empty_inline_keeps_softline_when_content_follows() {
    let src = "<p>Some prose text <span class=\"a-really-long-class-name-that-forces-the-open-tag-to-wrap-well-past-eighty-columns\"></span>more</p>";
    let out = fmt(src, &width_80(true));
    assert_eq!(
        out,
        "<p>\n  Some prose text <span\n    class=\"a-really-long-class-name-that-forces-the-open-tag-to-wrap-well-past-eighty-columns\"\n  ></span\n  >more\n</p>\n"
    );
}

// Default (`bracketSameLine = false`) still dangles the `>` onto its own line.
#[test]
fn bracket_same_line_default_dangles_closer_before_if_block() {
    let src = "<div class=\"a-long-class-name-that-overflows-eighty-columns\" id=\"identifier\" data-x=\"value\">\n  {#if cond}\n    <span>hi</span>\n  {/if}\n</div>";
    let out = fmt(src, &width_80(false));
    assert_eq!(
        out,
        "<div\n  class=\"a-long-class-name-that-overflows-eighty-columns\"\n  id=\"identifier\"\n  data-x=\"value\"\n>\n  {#if cond}\n    <span>hi</span>\n  {/if}\n</div>\n"
    );
}

// A deliberate whitespace-only inline element in prose (`<span>   </span>`, open
// tag NOT wrapped) keeps prettier's non-hug body — a single collapsed space —
// under `bracketSameLine`, rather than collapsing to the source-empty hug form.
// The source whitespace must be told apart from the wrap artifact an earlier pass
// inserts into source-EMPTY wrapped elements. See issue #1699.
#[test]
fn bracket_same_line_keeps_whitespace_content_inline_element() {
    let src = "<p>Some prose text <span>   </span> more prose after</p>";
    let out = fmt(src, &width_80(true));
    assert_eq!(
        out,
        "<p>Some prose text <span> </span> more prose after</p>\n"
    );
}

// The source-EMPTY sibling of the case above (`<span></span>`) still prints the
// hug/empty form — no space body — proving the whitespace vs empty distinction is
// preserved, not lost to a blanket clear.
#[test]
fn bracket_same_line_source_empty_inline_stays_empty() {
    let src = "<p>Some prose text <span></span> more prose after</p>";
    let out = fmt(src, &width_80(true));
    assert_eq!(
        out,
        "<p>Some prose text <span></span> more prose after</p>\n"
    );
}

// A standalone source-empty element (sole child of a block `<div>`, outside the
// children port) whose long open tag wraps must dedent its `>` onto its own line
// and glue `></span>` — matching prettier — instead of gluing the `>` to the last
// attribute and dangling `</span>`. Whitespace follows, so
// `canOmitSoftlineBeforeClosingTag` is true. See issue #1699.
#[test]
fn bracket_same_line_standalone_empty_element_dedents_closer() {
    let src = "<div>\n  <span class=\"a-really-long-class-name-that-forces-the-open-tag-to-wrap-well-past-eighty-columns\"></span>\n</div>";
    let out = fmt(src, &width_80(true));
    assert_eq!(
        out,
        "<div>\n  <span\n    class=\"a-really-long-class-name-that-forces-the-open-tag-to-wrap-well-past-eighty-columns\"\n  ></span>\n</div>\n"
    );
}

// The same standalone shape is identical under the default (`bracketSameLine =
// false`) — the fix must not diverge the two, since prettier's output does not
// depend on the flag here.
#[test]
fn bracket_same_line_standalone_empty_element_matches_default() {
    let src = "<div>\n  <span class=\"a-really-long-class-name-that-forces-the-open-tag-to-wrap-well-past-eighty-columns\"></span>\n</div>";
    let expected = "<div>\n  <span\n    class=\"a-really-long-class-name-that-forces-the-open-tag-to-wrap-well-past-eighty-columns\"\n  ></span>\n</div>\n";
    assert_eq!(fmt(src, &width_80(true)), expected);
    assert_eq!(fmt(src, &width_80(false)), expected);
}

// issue #1707: a source-whitespace inline element (`<span> </span>`) whose open
// tag wraps must break its whitespace body onto its own line — prettier's `line`
// body flexes to a newline once the wrapped open tag forces the group open — so
// the `>` glues to the last attribute under `bracketSameLine` and `</span>` drops
// below it. The non-port path previously kept the raw whitespace glued
// (`…"\n> </span>`), which both diverged from the oracle and was non-idempotent
// (a multi-space body collapsed to one space on a re-format).
#[test]
fn bracket_same_line_wrapping_whitespace_inline_breaks_body() {
    let src = "<span class=\"very-long-class-that-forces-the-open-tag-to-wrap-across-multiple-lines-in-output\"> </span>";
    let out = fmt(src, &width_80(true));
    assert_eq!(
        out,
        "<span\n  class=\"very-long-class-that-forces-the-open-tag-to-wrap-across-multiple-lines-in-output\">\n</span>\n"
    );
}

// Default (`bracketSameLine = false`): the `>` dedents onto its own line and the
// whitespace body still breaks, dropping `</span>` below it.
#[test]
fn default_wrapping_whitespace_inline_breaks_body() {
    let src = "<span class=\"very-long-class-that-forces-the-open-tag-to-wrap-across-multiple-lines-in-output\"> </span>";
    let out = fmt(src, &width_80(false));
    assert_eq!(
        out,
        "<span\n  class=\"very-long-class-that-forces-the-open-tag-to-wrap-across-multiple-lines-in-output\"\n>\n</span>\n"
    );
}

// The same shape nested inside a block element (indented one level) matches the
// oracle under both option values.
#[test]
fn bracket_same_line_nested_wrapping_whitespace_inline_breaks_body() {
    let src = "<div>\n  <span class=\"a-really-long-class-name-that-forces-the-open-tag-to-wrap-well-past-eighty-columns\"> </span>\n</div>";
    assert_eq!(
        fmt(src, &width_80(true)),
        "<div>\n  <span\n    class=\"a-really-long-class-name-that-forces-the-open-tag-to-wrap-well-past-eighty-columns\">\n  </span>\n</div>\n"
    );
    assert_eq!(
        fmt(src, &width_80(false)),
        "<div>\n  <span\n    class=\"a-really-long-class-name-that-forces-the-open-tag-to-wrap-well-past-eighty-columns\"\n  >\n  </span>\n</div>\n"
    );
}

// The fix is idempotent, including for a multi-space body that previously
// collapsed to a single space on a re-format (the non-idempotency of #1707).
#[test]
fn wrapping_whitespace_inline_is_idempotent() {
    let multi = "<span class=\"very-long-class-that-forces-the-open-tag-to-wrap-across-multiple-lines-in-output\">   </span>";
    for bsl in [true, false] {
        let once = fmt(multi, &width_80(bsl));
        let twice = fmt(&once, &width_80(bsl));
        assert_eq!(once, twice, "formatting must be idempotent (bsl={bsl})");
    }
}

// `<textarea>` is a raw-text exception to the inline whitespace-body rule: the
// oracle keeps `>` glued (never dedented) and, under the default
// `bracketSameLine: false`, glues the close tag too (dropping the whitespace
// body), while `bracketSameLine: true` breaks the body onto its own line. This
// exercises the `empty_nonhug` interaction with the empty-`<textarea>` width
// check.
#[test]
fn textarea_whitespace_body_matches_oracle_raw_text_layout() {
    let src = "<textarea class=\"very-long-class-that-forces-the-open-tag-to-wrap-across-multiple-lines-x\"> </textarea>";
    // bracketSameLine: true — `>` glued to the last attribute, body broken.
    assert_eq!(
        fmt(src, &width_80(true)),
        "<textarea\n  class=\"very-long-class-that-forces-the-open-tag-to-wrap-across-multiple-lines-x\">\n</textarea>\n"
    );
    // Default (false) — `>` glued, close glued, whitespace body dropped.
    assert_eq!(
        fmt(src, &width_80(false)),
        "<textarea\n  class=\"very-long-class-that-forces-the-open-tag-to-wrap-across-multiple-lines-x\"></textarea>\n"
    );
}

// A source-empty `<textarea>` still dangles its `>` onto its own line when the
// glued last line would overflow — unchanged by the whitespace-body handling.
#[test]
fn textarea_source_empty_dangles_closer_unchanged() {
    let src = "<textarea class=\"very-long-class-that-forces-the-open-tag-to-wrap-across-multiple-lines-x\"></textarea>";
    let expected = "<textarea\n  class=\"very-long-class-that-forces-the-open-tag-to-wrap-across-multiple-lines-x\"\n></textarea>\n";
    assert_eq!(fmt(src, &width_80(true)), expected);
    assert_eq!(fmt(src, &width_80(false)), expected);
}

// Regression for the #1707 whitespace-body rewrite interacting with the
// section-reorder remap: the markup edit that rewrites a whitespace body +
// close tag overlaps the indent pass's edit on the same whitespace text node, so
// one is dropped when the edits are applied. The section-span remap must be
// computed from the SAME overlap-resolved edit set — counting the dropped edit's
// length change shifted the `<style>` boundary past the output end and panicked
// in `sort_order::reorder_sections` ("end byte index … out of bounds").
#[test]
fn whitespace_body_rewrite_does_not_panic_reorder_remap() {
    let src = "<ul>\n\t<li>\n\t\t<a\n\t\t\tid=\"x\"\n\t\t\thref=\"https://example.com/some/really/long/url/that/forces/the/open/tag/to/wrap\"\n\t\t\taria-label=\"label\"\n\t\t>\n\t\t</a>\n\t</li>\n</ul>\n\n<style>\n\ta {\n\t\tcolor: red;\n\t}\n</style>";
    // The `<style>` body keeps the source indentation here — `width_80` configures
    // no CSS formatter — which is irrelevant to the reorder-remap regression.
    let expected = "<ul>\n  <li>\n    <a\n      id=\"x\"\n      href=\"https://example.com/some/really/long/url/that/forces/the/open/tag/to/wrap\"\n      aria-label=\"label\"\n    >\n    </a>\n  </li>\n</ul>\n\n<style>\n\ta {\n\t\tcolor: red;\n\t}\n</style>\n";
    assert_eq!(fmt(src, &width_80(false)), expected);
}

#[test]
fn sort_order_parse_rejects_invalid() {
    assert!(SortOrderSpec::parse("scripts-markup").is_none());
    assert!(SortOrderSpec::parse("scripts-scripts-markup-styles").is_none());
    assert!(SortOrderSpec::parse("foo-bar-baz-qux").is_none());
    assert!(SortOrderSpec::parse("options-scripts-markup-styles").is_some());
    assert!(SortOrderSpec::parse("none").is_some());
}
