use rsvelte_svelte_parser::parse::parse;
use rsvelte_svelte_syntax::syntax_tree::AttributeValue;

#[test]
fn boolean_attributes_exclude_trailing_whitespace() {
    for gap in [" ", "\t", "\n", "\r", "\u{c}", " \n\t "] {
        let source =
            format!("<input disabled{gap}class:active{gap}title{gap}={gap}\"日本語\"{gap}/>");
        let component = parse(&source).expect("attribute whitespace");
        component.tokens.check_lossless(&source).expect("all bytes");
        let attributes = &component.attributes;
        assert_eq!(attributes.len(), 3);
        assert_eq!(attributes[0].span.text(&source), "disabled");
        assert!(
            matches!(attributes[0].value, AttributeValue::True),
            "a boolean attribute"
        );
        assert_eq!(attributes[1].span.text(&source), "class:active");
        assert!(attributes[1].shorthand, "a shorthand class directive");
        assert_eq!(
            attributes[2].span.text(&source),
            format!("title{gap}={gap}\"日本語\"")
        );
    }
}

#[test]
fn whitespace_lookahead_keeps_blocks_expressions_and_comments() {
    for gap in ["", " ", "\t\n", "\u{c}"] {
        for source in [
            format!(
                "{{{gap}#if value}}<div title=\"{{{gap}value}}\"/>{{{gap}:else}}終わり{{{gap}/if}}"
            ),
            format!("{{{gap}/* comment */value}}"),
            format!("<textarea>日本語</TEXTAREA{gap}>"),
            format!("<script>let value = 1;</script{gap}>"),
        ] {
            let component = parse(&source).expect("whitespace lookahead");
            component.tokens.check_lossless(&source).expect("all bytes");
        }
    }
    let source = "<input disabled \n  \"value\"/>";
    let error = parse(source).expect_err("missing equals sign");
    assert_eq!(error.message, "expected `=`");
    assert_eq!(
        error.span.start_offset as usize,
        source.find('\"').expect("quote")
    );
}
