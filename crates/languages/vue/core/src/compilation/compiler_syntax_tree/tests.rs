use rsvelte_kernel::source::index::TypedIndex;

use super::*;

fn compiler_syntax_tree(source_text: &str) -> (SingleFileComponent, CompilerSyntaxTree) {
    let c = crate::parse::parse(source_text).expect("parses");
    let h = lower(&c, source_text).expect("a template");
    (c, h)
}

#[test]
fn text_is_decoded_and_condensed_as_base_parse_does() {
    let source_text = "<template>\n  <p>a  &amp;\n b</p>\n  <p>x</p> <b>y</b>\n</template>";
    let (_, h) = compiler_syntax_tree(source_text);
    let texts: Vec<&str> = h
        .nodes
        .iter()
        .filter_map(|n| match &n.kind {
            NodeKind::Text(t) => Some(t.text(source_text)),
            _ => None,
        })
        .collect();
    assert_eq!(texts, ["a & b", "x", " ", "y"]);
    assert_eq!(
        h.root().len(),
        4,
        "the runs holding a newline between elements are gone, the space is not"
    );
}

#[test]
fn tag_types_follow_base_parse() {
    let b = CompilerSyntaxTreeBuilder::new(0, 0);
    let none = IndexRange::new(PropertyIdentifier::new(0), PropertyIdentifier::new(0));
    let got: Vec<TagType> = ["div", "slot", "template", "component", "foo", "Transition"]
        .iter()
        .map(|t| b.tag_type(t, none, ""))
        .collect();
    assert_eq!(
        got,
        [
            TagType::Element,
            TagType::Slot,
            TagType::Element,
            TagType::Component,
            TagType::Component,
            TagType::Component
        ]
    );
}

#[test]
fn directives_are_split_and_every_node_points_back() {
    let source_text =
        "<template><li v-for=\"(x, i) in xs\" :key=\"i\" @click=\"f\">{{ x }}</li></template>";
    let (c, h) = compiler_syntax_tree(source_text);
    for (identifier, n) in h.nodes.iter_enumerated() {
        assert_eq!(
            c.node(h.origin[identifier]).span(),
            n.span,
            "{identifier:?}"
        );
    }
    let NodeKind::Element(el) = &h.node(h.root()[0]).kind else {
        panic!("an element")
    };
    let got: Vec<(DirectiveName, &str)> = h
        .props(el.props)
        .iter()
        .map(|p| match &p.kind {
            PropertyKind::Directive(d) => {
                (d.name, d.arg.as_ref().map_or("", |a| a.text(source_text)))
            }
            PropertyKind::Attribute { .. } => panic!("only directives"),
        })
        .collect();
    assert_eq!(
        got,
        [
            (DirectiveName::For, ""),
            (DirectiveName::Bind, "key"),
            (DirectiveName::On, "click")
        ]
    );
}
