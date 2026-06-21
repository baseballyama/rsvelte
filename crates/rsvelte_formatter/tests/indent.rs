use rsvelte_formatter::{FormatOptions, IndentStyle, IndentWidth, JsFormatOptions, format};

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
            ..JsFormatOptions::new()
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
            ..JsFormatOptions::new()
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
            ..JsFormatOptions::new()
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
            ..JsFormatOptions::new()
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
