//! prettier-plugin-svelte / oxfmt option support: `singleAttributePerLine`,
//! `svelteAllowShorthand`, `svelteIndentScriptAndStyle`, `svelteSortOrder`, and
//! `bracketSameLine`. Each asserts the non-default value diverges from the
//! default exactly the way oxfmt (`prettier-plugin-svelte`) does. See issue
//! #1057.

use rsvelte_formatter::{FormatOptions, SortOrderSpec, format};

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

#[test]
fn sort_order_parse_rejects_invalid() {
    assert!(SortOrderSpec::parse("scripts-markup").is_none());
    assert!(SortOrderSpec::parse("scripts-scripts-markup-styles").is_none());
    assert!(SortOrderSpec::parse("foo-bar-baz-qux").is_none());
    assert!(SortOrderSpec::parse("options-scripts-markup-styles").is_some());
    assert!(SortOrderSpec::parse("none").is_some());
}
