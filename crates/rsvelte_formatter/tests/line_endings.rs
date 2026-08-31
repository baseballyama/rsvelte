use rsvelte_formatter::{FormatOptions, format};

/// Prettier normalizes every line ending before it parses, so no region of its
/// output can carry a CR. rsvelte rewrites spans in place instead, and the two
/// regions it copies verbatim — a comment body and a whitespace-only `<style>` —
/// kept the source's CRLF. Each case is separate: a single "no CR survives"
/// assertion is satisfied by the region that already worked.
fn fmt(source: &str) -> String {
    format(source, &FormatOptions::default()).expect("format ok")
}

#[test]
fn a_comment_body_does_not_carry_a_cr_through() {
    assert_eq!(fmt("<!-- a\r\n     b -->\r\n"), "<!-- a\n     b -->\n");
}

#[test]
fn a_comment_inside_an_element_does_not_carry_a_cr_through() {
    assert_eq!(
        fmt("<div>\r\n  <!-- a\r\n  b -->\r\n</div>\r\n"),
        "<div>\n  <!-- a\n  b -->\n</div>\n",
    );
}

#[test]
fn an_empty_style_block_does_not_carry_a_cr_through() {
    assert_eq!(
        fmt("<div>a</div>\r\n\r\n<style>\r\n</style>\r\n"),
        "<div>a</div>\n\n<style>\n</style>\n",
    );
}

#[test]
fn a_lone_cr_is_a_line_ending_too() {
    assert_eq!(fmt("<!-- a\r     b -->\r"), "<!-- a\n     b -->\n");
}

/// Controls: regions the indent pass already rewrites were never affected, and
/// a BOM still round-trips now that the CR pass sits between it and the parse.
#[test]
fn markup_script_and_style_were_already_normalized() {
    assert_eq!(
        fmt("<div>\r\n  <p>a</p>\r\n</div>\r\n"),
        "<div>\n  <p>a</p>\n</div>\n"
    );
    assert_eq!(
        fmt("<script>\r\n  let a = 1;\r\n</script>\r\n"),
        "<script>\n  let a = 1;\n</script>\n",
    );
}

#[test]
fn a_bom_still_round_trips_across_the_cr_normalization() {
    assert_eq!(
        fmt("\u{feff}<div>\r\n  <p>a</p>\r\n</div>\r\n"),
        "\u{feff}<div>\n  <p>a</p>\n</div>\n"
    );
    assert_eq!(
        fmt("\u{feff}<div>\n  <p>a</p>\n</div>\n"),
        "\u{feff}<div>\n  <p>a</p>\n</div>\n"
    );
}
