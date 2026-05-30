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
