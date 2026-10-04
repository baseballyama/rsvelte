use rsvelte_svelte_parser::parse::parse;
use rsvelte_svelte_syntax::syntax_tree::TokenType;

#[test]
fn javascript_regions_keep_comments_and_whitespace() {
    for (source, expected_comments) in [
        ("<script> let value = 1; </script>{ value }", vec![]),
        (
            "<script> /* block */ // line\n </script>",
            vec!["/* block */", "// line"],
        ),
        (
            "<script>// before\nlet value = 1; /* after */</script>{/* expression */value}",
            vec!["// before", "/* after */", "/* expression */"],
        ),
        (
            "<script lang='ts'>let value: number = 1;</script>{value /* tail */}",
            vec!["/* tail */"],
        ),
        ("<script> \n </script>", vec![]),
        ("<script>let value = '/* text */';</script>{value}", vec![]),
    ] {
        let component = parse(source).expect("JavaScript region");
        component.tokens.check_lossless(source).expect("all bytes");
        let comments: Vec<_> = component
            .tokens
            .iter()
            .filter(|token| token.kind == TokenType::JavaScriptComment)
            .map(|token| token.span.text(source))
            .collect();
        assert_eq!(comments, expected_comments);
    }
}
