//! Upstream reads an unpreprocessed indented-Sass block as ordinary CSS, so
//! the whole thing is one selector until a `:` is followed by something
//! `read_identifier` refuses. The point diagnostic sits immediately after THAT
//! colon, which is not the first colon in the block: a pseudo-class, a `::`
//! pseudo-element, a `:-moz-` prefix and a colon inside a comment or a string
//! all read fine and are passed over.
//!
//! Every expectation is the official compiler's position for the same source.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

#[test]
fn unprocessed_indented_sass_errors_after_the_first_property_colon() {
    let source = "<style lang=\"sass\">\n\t.card\n\t\tdisplay: block\n</style>";
    let expected = u32::try_from(source.find("display:").unwrap() + "display:".len()).unwrap();

    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let diagnostic = compile(
            source,
            CompileOptions {
                generate,
                ..Default::default()
            },
        )
        .expect_err("official rejects Sass that has not been preprocessed")
        .diagnostic();

        assert_eq!(
            (diagnostic.code.as_deref(), diagnostic.span,),
            (Some("css_expected_identifier"), Some((expected, expected)))
        );
    }
}

/// `pos_after(source, needle)` is the offset just past `needle` — the shape
/// every expectation here takes, because upstream reports one character past
/// the colon it gave up on.
fn pos_after(source: &str, needle: &str) -> u32 {
    u32::try_from(source.find(needle).unwrap() + needle.len()).unwrap()
}

fn error_span(source: &str) -> (Option<String>, Option<(u32, u32)>) {
    let d = compile(
        source,
        CompileOptions {
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect_err("official rejects this block")
    .diagnostic();
    (d.code.clone(), d.span)
}

fn assert_stops_after(source: &str, needle: &str) {
    let expected = pos_after(source, needle);
    assert_eq!(
        error_span(source),
        (
            Some("css_expected_identifier".to_string()),
            Some((expected, expected))
        ),
        "{source:?}"
    );
}

#[test]
fn a_pseudo_class_colon_is_not_the_property_colon() {
    // Reduced from date-picker-svelte's `+layout.svelte`, which reported at a
    // `//` 260 bytes past where official reports.
    assert_stops_after(
        "<style>\n\t:global(:root)\n\t\t--primary: #1a79ff\n</style>",
        "--primary:",
    );
    assert_stops_after("<style>\n\ta:hover\n\t\tcolor: red\n</style>", "color:");
    assert_stops_after(
        "<style>\n\ta:hover:focus\n\t\tcolor: red\n</style>",
        "color:",
    );
}

#[test]
fn a_pseudo_element_and_a_vendor_prefix_read_as_names_too() {
    assert_stops_after("<style>\n\ta::before\n\t\tcolor: red\n</style>", "color:");
    assert_stops_after("<style>\n\ta:-moz-x\n\t\tcolor: red\n</style>", "color:");
    // `-?\d` is what `read_identifier` refuses outright, so this colon IS it.
    assert_stops_after("<style>\n\ta:1x\n\t\tcolor: red\n</style>", "a:");
}

#[test]
fn a_colon_inside_a_string_or_a_comment_is_not_a_colon() {
    assert_stops_after(
        "<style>\n\ta[href=\"x: y\"]\n\t\tcolor: red\n</style>",
        "color:",
    );
    assert_stops_after(
        "<style>\n\t/* c: d */\n\ta\n\t\tcolor: red\n</style>",
        "color:",
    );
}

fn assert_error_at(source: &str, expected: usize) {
    let expected = u32::try_from(expected).expect("fixture offset fits in u32");

    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let diagnostic = compile(
            source,
            CompileOptions {
                generate,
                ..Default::default()
            },
        )
        .expect_err("official rejects this CSS")
        .diagnostic();

        assert_eq!(
            (diagnostic.code.as_deref(), diagnostic.span),
            (Some("css_expected_identifier"), Some((expected, expected)))
        );
    }
}

#[test]
fn a_pseudo_class_colon_is_not_the_first_property_colon() {
    let source =
        "<style lang=\"sass\">\n\t:global(:root)\n\t\t--primary: #1a79ff\n\t\tcolor: red\n</style>";
    assert_error_at(
        source,
        source.find("--primary:").unwrap() + "--primary:".len(),
    );
}

#[test]
fn with_no_stopping_colon_the_point_is_the_end_of_the_block() {
    // `color:red` reads as a name after the colon, so nothing stops the scan.
    let source = "<style>\n\ta\n\t\tcolor:red\n</style>";
    let expected = u32::try_from(source.find("</style>").unwrap()).unwrap();
    assert_eq!(
        error_span(source),
        (
            Some("css_expected_identifier".to_string()),
            Some((expected, expected))
        )
    );
    let source = "<style>\n\ta:hover\n</style>";
    let expected = u32::try_from(source.find("</style>").unwrap()).unwrap();
    assert_eq!(
        error_span(source),
        (
            Some("css_expected_identifier".to_string()),
            Some((expected, expected))
        )
    );
}

#[test]
fn a_later_line_comment_does_not_outrank_an_earlier_identifier_error() {
    let source = "<style lang=\"sass\">\n\t:global(:root)\n\t\t--primary: #1a79ff\n\n\t\t// for demo editing\n\t\t--bg: #fff\n</style>";
    assert!(source.find("//").unwrap() > source.find("--primary:").unwrap());
    assert_error_at(
        source,
        source.find("--primary:").unwrap() + "--primary:".len(),
    );
}

#[test]
fn a_line_comment_wins_only_when_it_comes_first() {
    // Both are stopping points; upstream reports whichever it reaches first.
    let source = "<style>\n\t// c\n\ta\n\t\tcolor: red\n</style>";
    let expected = u32::try_from(source.find("//").unwrap()).unwrap();
    assert_eq!(
        error_span(source),
        (
            Some("css_expected_identifier".to_string()),
            Some((expected, expected))
        )
    );
    assert_stops_after("<style>\n\ta\n\t\tcolor: red\n\t// c\n</style>", "color:");
    // With no stopping colon the `//` is reached first after all.
    let source = "<style>\n\ta\n\t\tcolor red\n\t// c\n</style>";
    let expected = u32::try_from(source.find("//").unwrap()).unwrap();
    assert_eq!(
        error_span(source),
        (
            Some("css_expected_identifier".to_string()),
            Some((expected, expected))
        )
    );
}

#[test]
fn content_that_forms_no_rule_at_all_still_reports_at_the_block_end() {
    let source = "<style>\n\tthis is not css\n</style>";
    assert_error_at(source, source.find("</style>").unwrap());
}
