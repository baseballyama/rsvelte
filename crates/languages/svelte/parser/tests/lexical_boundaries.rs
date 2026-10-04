use rsvelte_svelte_parser::parse::parse;
use rsvelte_svelte_syntax::syntax_tree::{AttributeValue, Part, TemplateNode};

#[test]
fn quoted_values_keep_unicode_and_expression_boundaries() {
    let text = "日本語🙂".repeat(40);
    for quote in ['\'', '"'] {
        let source = format!("<div title={quote}{text}{{value}}終わり{quote}></div>");
        let component = parse(&source).expect("quoted value");
        component.tokens.check_lossless(&source).expect("all bytes");
        let AttributeValue::Parts(parts) = component.attributes[0].value else {
            panic!("a quoted attribute has parts");
        };
        let [
            Part::Text(before),
            Part::Expression { span, .. },
            Part::Text(after),
        ] = component.parts(parts)
        else {
            panic!("text, expression, text");
        };
        assert_eq!(before.text(&source), text);
        assert_eq!(span.text(&source), "{value}");
        assert_eq!(after.text(&source), "終わり");
    }
}

#[test]
fn unquoted_values_keep_slashes_and_vertical_tabs() {
    for (source, expected) in [
        ("<div title=日本語🙂/path/>", "日本語🙂/path"),
        ("<div title=a\u{b}b/>", "a\u{b}b"),
        ("<div title=/></div>", "/"),
    ] {
        let component = parse(source).expect("unquoted value");
        component.tokens.check_lossless(source).expect("all bytes");
        let AttributeValue::Parts(parts) = component.attributes[0].value else {
            panic!("an unquoted attribute has parts");
        };
        let [Part::Text(span)] = component.parts(parts) else {
            panic!("one text part");
        };
        assert_eq!(span.text(source), expected);
    }
}

#[test]
fn empty_and_adjacent_expression_values_keep_their_parts() {
    let source = r#"<div empty="" value="{left}{right}"/>"#;
    let component = parse(source).expect("attributes");
    component.tokens.check_lossless(source).expect("all bytes");
    let AttributeValue::Parts(empty) = component.attributes[0].value else {
        panic!("empty value has parts");
    };
    let [Part::Text(span)] = component.parts(empty) else {
        panic!("one empty text part");
    };
    assert!(span.is_empty());
    let AttributeValue::Parts(expressions) = component.attributes[1].value else {
        panic!("expression value has parts");
    };
    assert!(matches!(
        component.parts(expressions),
        [Part::Expression { .. }, Part::Expression { .. }]
    ));
}

#[test]
fn raw_elements_and_textarea_keep_their_closing_rules() {
    for source in [
        "<script>let text = '</scriptx>';</script \n>",
        "<style>p { color: red }</style\t>",
        "<div><script>日本語</script><style>🙂</style></div>",
        "<textarea>日本語 <tag>🙂{value}</TEXTAREA \n>",
    ] {
        let component = parse(source).expect("raw element");
        component.tokens.check_lossless(source).expect("all bytes");
    }
}

#[test]
fn debug_tags_keep_single_and_multiple_identifiers() {
    for (source, count) in [("{@debug left}", 1), ("{@debug left, right}", 2)] {
        let component = parse(source).expect("debug tag");
        component.tokens.check_lossless(source).expect("all bytes");
        let TemplateNode::Debug { identifiers, .. } = component.nodes[0] else {
            panic!("debug node");
        };
        assert_eq!(component.javascript_list(identifiers).len(), count);
        assert_eq!(component.template_expressions.len(), count);
    }
}

#[test]
fn unterminated_values_report_the_utf8_byte_offset() {
    let source = "<div title=\"日本語🙂";
    let error = parse(source).expect_err("unterminated quote");
    assert_eq!(error.message, "unexpected end of input");
    assert_eq!(error.span.start_offset as usize, source.len());
}

#[test]
fn component_names_keep_their_member_tree_and_source_positions() {
    use rsvelte_typescript::{Kind, NodeIdentifier};
    let source = "<UI.Button /><item.component /><div />";
    let parsed = parse(source).expect("component tags");
    parsed.tokens.check_lossless(source).expect("all bytes");
    for (index, object_name, property_name) in [(0, "UI", "Button"), (1, "item", "component")] {
        let TemplateNode::Element { component, .. } = parsed.nodes[index] else {
            panic!("an element");
        };
        let Kind::Member {
            object,
            property,
            computed: false,
            ..
        } = parsed.javascript.kind(component)
        else {
            panic!("a member reference");
        };
        for (node, name) in [(object, object_name), (property, property_name)] {
            assert_eq!(parsed.javascript.name(node), name);
            assert_eq!(
                parsed
                    .javascript
                    .source_location(node)
                    .span()
                    .expect("source position")
                    .text(source),
                name
            );
        }
    }
    let TemplateNode::Element { component, .. } = parsed.nodes[2] else {
        panic!("an element");
    };
    assert_eq!(component, NodeIdentifier::NONE);
}
