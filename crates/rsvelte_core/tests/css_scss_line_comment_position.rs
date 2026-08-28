use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn assert_error_at(source: &str, expected: usize) {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let diagnostic = compile(
            source,
            CompileOptions {
                generate,
                ..Default::default()
            },
        )
        .expect_err("official rejects unprocessed SCSS line comments")
        .diagnostic();

        assert_eq!(
            (diagnostic.code.as_deref(), diagnostic.span),
            (Some("css_expected_identifier"), Some((expected, expected)))
        );
    }
}

#[test]
fn line_comment_only_style_errors_at_the_first_slash() {
    let source = "<style lang=\"scss\">\n  // one\n  // two\n</style>";
    assert_error_at(source, source.find("//").unwrap());
}

#[test]
fn block_item_lookahead_distinguishes_line_comment_declarations_and_rules() {
    let source = "<style lang=\"scss\">\n.a {\n  // declaration: accepted;\n  // selector: nested\n  &.b {}\n}\n</style>";
    let first = source.find("//").unwrap();
    let second = source[first + 2..].find("//").unwrap() + first + 2;
    assert_error_at(source, second);
}
