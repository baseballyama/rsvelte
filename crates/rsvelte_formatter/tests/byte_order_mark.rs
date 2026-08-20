use rsvelte_formatter::{FormatOptions, format};

/// `parse` strips a leading BOM, so its spans are relative to the stripped
/// text. Slicing the unstripped source with them lands three bytes off, which
/// made every BOM-prefixed component with a `<script>` fail to format at all —
/// and prettier keeps the BOM, so it has to come back out.
#[test]
fn a_leading_bom_is_stripped_for_spans_and_restored_in_the_output() {
    let source = "\u{feff}<script>\n\tlet a   =  1;\n</script>\n\n<div   class=\"x\" >{a}</div>\n";
    let out = format(source, &FormatOptions::default()).expect("format ok");
    assert_eq!(
        out,
        "\u{feff}<script>\n  let a = 1;\n</script>\n\n<div class=\"x\">{a}</div>\n",
    );
}

#[test]
fn a_leading_bom_survives_a_script_less_component() {
    let source = "\u{feff}<div   class=\"x\" >hi</div>\n";
    let out = format(source, &FormatOptions::default()).expect("format ok");
    assert_eq!(out, "\u{feff}<div class=\"x\">hi</div>\n");
}
