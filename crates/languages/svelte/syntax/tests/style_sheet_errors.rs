use rsvelte_svelte_syntax::parse::parse;

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

// Each verdict was checked against svelte 5's `compile`.
#[test]
fn a_closing_tag_the_sheet_reads_is_its_content() {
    for (source, rule) in [
        (
            "<p class=\"a\">x</p><style>.a { content: \"a</style>b\" }</style>",
            ".a",
        ),
        (
            "<p class=\"a\">x</p><style>.a { background: url(</style>) }</style>",
            ".a",
        ),
        (
            "<p class=\"a\">x</p><style>.a[data-x=\"</style>\"] { color: red }</style>",
            ".a",
        ),
        (
            "<p class=\"a\">x</p><style>/* </style> */ .a { color: red }</style>",
            ".a",
        ),
    ] {
        let component = parse(source).expect(source);
        let style = component.style.as_ref().expect("a style");
        assert!(style.content.text(source).ends_with('}'), "{source}");
        assert!(component.style_error().is_none(), "{source}");
        assert!(style.content.text(source).contains(rule), "{source}");
        component.tokens.check_lossless(source).expect("all bytes");
    }
}

#[test]
fn text_after_a_closing_tag_without_its_bracket_is_the_template_s() {
    let source = "<style>a {\n  color: red;\n}</style x>";
    let component = parse(source).expect("the component parses");
    assert_eq!(component.root.len, 1);
    component.tokens.check_lossless(source).expect("all bytes");
}

#[test]
fn a_sheet_that_does_not_parse_ends_at_the_first_closing_tag() {
    let source = "<style>.a { content: \"x }</style><p>after</p>";
    let component = parse(source).expect("the markup parses");
    assert!(component.style_error().is_some());
    assert_eq!(component.root.len, 1);
}

// Svelte 5 reports `unexpected_eof` at 23, the end of the template without its trailing newline.
#[test]
fn an_open_rule_ends_where_the_template_s_text_ends() {
    let source = "<style>a { b: c</style>\n";
    let component = parse(source).expect("the markup parses");
    let error = component.style_error().expect("the rule is open");
    assert_eq!(error.span.start_offset, 23);
}

// Svelte 5 reports `expected_token` at 17 for the first and `unexpected_eof` at 12 for the second.
#[test]
fn a_style_without_its_closing_tag_reports_what_svelte_does() {
    let error = parse("<style>a { b: c }\n").expect_err("the style is open");
    assert_eq!(error.code, "expected_token");
    assert_eq!(error.span.start_offset, 17);
    let error = parse("<style>a { b\n").expect_err("the rule is open");
    assert_eq!(error.code, "unexpected_eof");
    assert_eq!(error.span.start_offset, 12);
}
