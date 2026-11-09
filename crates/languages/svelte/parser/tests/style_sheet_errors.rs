use rsvelte_svelte_parser::parse::parse;

const BAD_STYLE: &str = "<style>// not CSS\n.a { color: red; }</style>";

#[test]
fn a_style_sheet_error_alone_keeps_the_component() {
    let component =
        parse(&format!("<div class=\"a\"></div>{BAD_STYLE}")).expect("the markup parses");
    let error = component
        .style_error()
        .expect("the style sheet does not parse");
    assert_eq!(error.code, "css_parse_error");
    assert_eq!(component.root.len, 1);
}

#[test]
fn the_first_error_in_the_document_wins() {
    let style_first =
        parse(&format!("{BAD_STYLE}<div>{{</div>")).expect_err("the document does not parse");
    assert_eq!(style_first.code, "css_parse_error");
    let markup_first =
        parse(&format!("<div>{{</div>{BAD_STYLE}")).expect_err("the document does not parse");
    assert_ne!(markup_first.code, "css_parse_error");
}
