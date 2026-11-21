//! Upstream parses the component without its trailing whitespace, JavaScript's `trimEnd` set, so
//! the input ends there; positions stay offsets into the document.

use rsvelte_svelte_syntax::parse::parse;

#[test]
fn the_input_ends_before_the_trailing_whitespace() {
    // What svelte 5.57.3 reports, in bytes of each source.
    for (source, code, at) in [
        ("<script>\n", "unexpected_eof", 8),
        ("<script>\u{FEFF}", "unexpected_eof", 8),
        ("<script>\u{A0}", "unexpected_eof", 8),
        ("<script>\u{2028}", "unexpected_eof", 8),
        ("<script>\u{2029}", "unexpected_eof", 8),
        ("<script>\u{202F}", "unexpected_eof", 8),
        ("<script>\u{3000}", "unexpected_eof", 8),
        ("<script>a\u{FEFF}", "element_unclosed", 9),
        ("<script>a\u{A0}", "element_unclosed", 9),
        ("<script>a\u{2029}", "element_unclosed", 9),
        // U+0085 is no JavaScript whitespace, so it is the script's content.
        ("<script>\u{85}", "element_unclosed", 10),
        ("{@debug \u{A0}", "js_parse_error", 7),
    ] {
        let error = parse(source).expect_err(source);
        assert_eq!(error.code, code, "{source:?}");
        assert_eq!(error.span.start_offset, at, "{source:?}");
    }
}

#[test]
fn the_trailing_whitespace_is_still_a_token() {
    for source in ["<p>a</p>\n", "<p>a</p>\u{FEFF}", "<p>a</p> \u{A0}\n"] {
        let component = parse(source).expect(source);
        component.tokens.check_lossless(source).expect(source);
    }
}
