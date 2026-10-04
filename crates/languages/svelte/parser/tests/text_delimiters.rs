use rsvelte_svelte_parser::parse::parse;
use rsvelte_svelte_syntax::syntax_tree::TemplateNode;

#[test]
fn comments_keep_the_first_end_and_do_not_set_script_language() {
    for body in ["", "日本語🙂 -- --", "<script lang=\"ts\">", "---"] {
        let source = format!("<!--{body}--><p>after</p>");
        let component = parse(&source).expect("comment and element");
        component.tokens.check_lossless(&source).expect("all bytes");
        let [comment, element] = component.children(component.root) else {
            panic!("comment and element");
        };
        let TemplateNode::Comment { data, .. } = component.nodes[*comment as usize] else {
            panic!("a comment");
        };
        assert_eq!(data.text(&source), body);
        assert!(matches!(
            component.nodes[*element as usize],
            TemplateNode::Element { .. }
        ));
    }
    let source = "<!--<script lang=\"ts\">--><script>let value: number = 1;</script>";
    let error = parse(source).expect_err("comment does not enable TypeScript");
    assert_eq!(error.code, "js_parse_error");
    let source = "<!--<script>--><script lang=\"ts\">let value: number = 1;</script>";
    assert!(
        parse(source)
            .expect("real TypeScript script")
            .instance
            .as_ref()
            .expect("instance script")
            .typescript
    );
    let error = parse("<!--日本語🙂--").expect_err("unterminated comment");
    assert_eq!(error.message, "unterminated comment");
    assert_eq!(error.span.start_offset, 0);
}

#[test]
fn nested_raw_elements_keep_text_and_exact_closing_names() {
    for name in ["script", "style"] {
        let body = format!("日本語🙂</{name}x><{name}>{{value}}");
        let source = format!("<div><{name}>{body}</{name}><p/></div>");
        let component = parse(&source).expect("nested raw element");
        component.tokens.check_lossless(&source).expect("all bytes");
        let text = component
            .nodes
            .iter()
            .find_map(|node| match node {
                TemplateNode::Text { span } => Some(span.text(&source)),
                _ => None,
            })
            .expect("raw text");
        assert_eq!(text, body);
        let source = format!("<div><{name}>日本語</{name}x></div>");
        let error = parse(&source).expect_err("exact closing name required");
        assert_eq!(error.message, format!("expected `</{name}>`"));
        assert_eq!(error.span.start_offset as usize, source.len());
    }
}
