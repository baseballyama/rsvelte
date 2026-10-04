use rsvelte_svelte_parser::parse::parse;
use rsvelte_svelte_syntax::syntax_tree::{Component, Range, TemplateNode};

fn element_names<'a>(component: &Component, children: Range, source: &'a str) -> Vec<&'a str> {
    component
        .children(children)
        .iter()
        .map(|&node| {
            let TemplateNode::Element { name, .. } = component.nodes[node as usize] else {
                panic!("an element");
            };
            name.text(source)
        })
        .collect()
}

#[test]
fn optional_closing_rules_keep_siblings_and_nested_elements() {
    for (source, expected) in [
        ("<div><p>前<div>内</div></div>", vec!["p", "div"]),
        ("<ul><li>一<li>二</li></ul>", vec!["li", "li"]),
        ("<dl><dt>名前<dd>値</dd></dl>", vec!["dt", "dd"]),
        ("<div><div>内</div></div>", vec!["div"]),
        (
            "<div><UI.Button/><Ω/><div/></div>",
            vec!["UI.Button", "Ω", "div"],
        ),
    ] {
        let component = parse(source).expect("element boundaries");
        component.tokens.check_lossless(source).expect("all bytes");
        let [root] = component.children(component.root) else {
            panic!("one root element");
        };
        let TemplateNode::Element { children, .. } = component.nodes[*root as usize] else {
            panic!("a root element");
        };
        assert_eq!(element_names(&component, children, source), expected);
    }
}

#[test]
fn closing_names_keep_unicode_whitespace_and_error_positions() {
    for source in [
        "<Ω>日本語</Ω \n>",
        "<UI.Button>text</UI.Button\t>",
        "<!DOCTYPE html><input disabled/><div></div>",
        "<script>let value = 1;</script><style>p { color: red }</style>",
    ] {
        let component = parse(source).expect("closing name");
        component.tokens.check_lossless(source).expect("all bytes");
    }
    let source = "<UI.Button></UI.Other>";
    let error = parse(source).expect_err("mismatched component closing name");
    assert_eq!(
        error.message,
        "`</UI.Other>` attempted to close an element that was not open"
    );
    assert_eq!(
        error.span.start_offset as usize,
        source.find("</").expect("closing tag")
    );
}
