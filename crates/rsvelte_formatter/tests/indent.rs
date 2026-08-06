use rsvelte_formatter::{
    FormatOptions, IndentStyle, IndentWidth, JsFormatOptions, LineWidth, format,
};

#[test]
fn default_options_indent_with_two_spaces() {
    let src = "<script>let x=1</script>";
    let out = format(src, &FormatOptions::default()).expect("format ok");
    assert!(
        out.contains("\n  let x = 1;\n"),
        "expected 2-space indent under <script>:\n{out}"
    );
}

#[test]
fn tab_indent_style_uses_tabs_for_outer_wrap() {
    let opts = FormatOptions {
        js: JsFormatOptions {
            indent_style: IndentStyle::Tab,
            ..JsFormatOptions::default()
        },
        ..FormatOptions::default()
    };

    let src = "<script>let x=1</script>";
    let out = format(src, &opts).expect("format ok");
    assert!(
        out.contains("\n\tlet x = 1;\n"),
        "expected tab indent under <script>:\n{out:?}"
    );
}

#[test]
fn four_space_indent_uses_four_spaces() {
    let opts = FormatOptions {
        js: JsFormatOptions {
            indent_width: IndentWidth::try_from(4).expect("4 is valid"),
            ..JsFormatOptions::default()
        },
        ..FormatOptions::default()
    };

    let src = "<script>let x=1</script>";
    let out = format(src, &opts).expect("format ok");
    assert!(
        out.contains("\n    let x = 1;\n"),
        "expected 4-space indent under <script>:\n{out:?}"
    );
}

#[test]
fn snippet_tab_body_converts_to_spaces() {
    let src = "{#snippet children(args)}\n\t{args}\n{/snippet}\n";
    let out = format(src, &FormatOptions::default()).expect("format ok");
    assert!(
        out.contains("  {args}"),
        "expected 2-space indent inside snippet (tabs→spaces):\n{out:?}"
    );
}

/// Collapse path with 4-space indent: a fill-wrapped prose paragraph inside a nested div
/// should use 4-space continuation lines, not 2-space.
#[test]
fn collapse_fill_run_uses_four_space_indent() {
    let opts = FormatOptions {
        js: JsFormatOptions {
            indent_width: IndentWidth::try_from(4).expect("4 is valid"),
            ..JsFormatOptions::default()
        },
        ..FormatOptions::default()
    };

    // A <p> with long prose text that will need fill-wrapping at 80 cols.
    let src = "<div>\n    <p>The quick brown fox jumps over the lazy dog and then some more text here</p>\n</div>\n";
    let out = format(src, &opts).expect("format ok");
    // Either fits on one line OR continuation lines use 4-space indent (no 2-space-only indents in formatted output)
    let has_two_space_only = out
        .lines()
        .any(|l| l.starts_with("  ") && !l.starts_with("    "));
    assert!(
        !has_two_space_only,
        "collapse fill run with 4-space indent should not produce 2-space continuation lines:\n{out:?}"
    );
}

/// Collapse path with tab indent: a hugged inline element inside a nested element
/// should use tab-indented continuation lines.
#[test]
fn collapse_hug_mixed_uses_tab_indent() {
    let opts = FormatOptions {
        js: JsFormatOptions {
            indent_style: IndentStyle::Tab,
            ..JsFormatOptions::default()
        },
        ..FormatOptions::default()
    };

    // A <div> with mixed inline content that will be hug-formatted.
    let src = "<div>\n\t<span>some text</span>\n</div>\n";
    let out = format(src, &opts).expect("format ok");
    // The output should use tabs for indentation, not spaces.
    let has_space_indent = out.lines().any(|l| l.starts_with("  "));
    assert!(
        !has_space_indent,
        "collapse with tab indent should not produce space-indented lines:\n{out:?}"
    );
}

/// A block body keeps an inline-level child hugged to the following text only
/// while that child prints flat. The fit test must measure display width, not
/// char count: this `<Icon>` is 57 chars but 97 columns wide, so it breaks and
/// the run must break with it. No corpus file mixes full-width text with this
/// shape, so assert it here.
#[test]
fn block_body_inline_child_fit_uses_display_width() {
    let el = format!("<Icon title=\"{}\" />", "日".repeat(40));
    let src = format!("<div>\n  {{#if v}}\n    {el} {{label}}\n  {{/if}}\n</div>\n");
    let out = format(&src, &FormatOptions::default()).expect("format ok");
    assert!(
        !out.contains("/> {label}"),
        "expected the wide Icon to break away from the trailing text:\n{out}"
    );
}

// ─── #2058: multi-line attribute values under `useTabs` ──────────────────
//
// A multi-line attribute value is formatted at column 0 and re-indented to the
// attribute column afterwards. That re-indent used to treat any line starting
// with a tab as verbatim raw HTML text, which is true only while the embedded
// JS is space-indented — under `useTabs` the formatted JS is tab-indented too,
// so every continuation line was left at column 0. Expectations below are the
// oxfmt(`svelte: true`) oracle's output for the user's config (#2058).

fn tab_opts() -> FormatOptions {
    FormatOptions {
        js: JsFormatOptions {
            indent_style: IndentStyle::Tab,
            indent_width: IndentWidth::try_from(4).expect("4 is valid"),
            line_width: LineWidth::try_from(100).expect("100 is valid"),
            ..JsFormatOptions::default()
        },
        ..FormatOptions::default()
    }
}

#[test]
fn tab_indent_reindents_multiline_arrow_attribute() {
    let src = "<div class=\"wrap\">\n\t<div class=\"panel\">\n\t\t<div class=\"inner\">\n\t\t\t<SvelteFlow\n\t\t\t\tfitView\n\t\t\t\tonmove={(_event, viewport) => {\n\t\t\t\t\tgraph.activeDocument.viewport = { ...viewport };\n\t\t\t\t}}\n\t\t\t/>\n\t\t</div>\n\t</div>\n</div>\n";
    let out = format(src, &tab_opts()).expect("format ok");
    assert_eq!(out, src);
}

#[test]
fn tab_indent_reindents_multiline_bind_getter_setter() {
    let src = "<div>\n\t<div>\n\t\t<Comp\n\t\t\tbind:value={\n\t\t\t\t() => internalValueForTheBinding,\n\t\t\t\t(v) => {\n\t\t\t\t\tinternalValueForTheBinding = v;\n\t\t\t\t}\n\t\t\t}\n\t\t/>\n\t</div>\n</div>\n";
    let out = format(src, &tab_opts()).expect("format ok");
    assert_eq!(out, src);
}

#[test]
fn tab_indent_reindents_multiline_object_attribute() {
    let src = "<div>\n\t<div>\n\t\t<div>\n\t\t\t<Chart\n\t\t\t\tconfig={{\n\t\t\t\t\tkind: \"line\",\n\t\t\t\t\tpadding: { top: 10, right: 20, bottom: 30, left: 40 },\n\t\t\t\t\tanimate: true,\n\t\t\t\t}}\n\t\t\t/>\n\t\t</div>\n\t</div>\n</div>\n";
    let out = format(src, &tab_opts()).expect("format ok");
    assert_eq!(out, src);
}

#[test]
fn tab_indent_reindents_multiline_arrow_beside_long_string_attribute() {
    let src = "<div>\n\t<div>\n\t\t<button\n\t\t\tclass=\"a very long list of utility classes that will definitely not fit on one line at all\"\n\t\t\tonclick={async () => {\n\t\t\t\tawait save();\n\t\t\t\ttoast.show(\"saved\");\n\t\t\t}}\n\t\t>\n\t\t\tSave\n\t\t</button>\n\t</div>\n</div>\n";
    let out = format(src, &tab_opts()).expect("format ok");
    assert_eq!(out, src);
}

/// The interior of a template literal is program text, not indentation: it must
/// survive the re-indent verbatim even though its lines start with tabs.
#[test]
fn tab_indent_keeps_template_literal_interior_verbatim() {
    let src = "<div>\n\t<div>\n\t\t<Comp\n\t\t\ttemplate={`\n\tfirst line of the template literal\n\tsecond line of the template literal\n`}\n\t\t/>\n\t</div>\n</div>\n";
    let out = format(src, &tab_opts()).expect("format ok");
    assert_eq!(out, src);
}
