use rsvelte_kernel::source::positions::Span;

use super::super::parse_jsx_program;
use crate::NodeIdentifier;
use crate::syntax_tree::{Jsx, Kind, SyntaxTree};

/// The tree of a `.tsx` program, and its statements.
fn tsx(source_text: &str) -> Result<(SyntaxTree, Vec<NodeIdentifier>), String> {
    let mut tree = SyntaxTree::new();
    let program = parse_jsx_program(
        &mut tree,
        source_text,
        Span::new(0, source_text.len() as u32),
        true,
    )
    .map_err(|e| e.message)?;
    let statements = match tree.kind(program) {
        Kind::Program(statements) => statements.to_vec(),
        _ => return Err("not a program".to_owned()),
    };
    Ok((tree, statements))
}

/// A JSX node as `Variant"text"(children)`, attributes and children in order; any other node is
/// its quoted text.
fn outline(tree: &SyntaxTree, source_text: &str, node: NodeIdentifier) -> String {
    let text = |n: NodeIdentifier| {
        tree.source_location(n)
            .span()
            .expect("located")
            .text(source_text)
    };
    let Kind::Jsx(jsx) = tree.kind(node) else {
        return format!("{:?}", text(node));
    };
    let parts: Vec<String> = match jsx {
        Jsx::Element {
            name,
            attributes,
            children,
        } => name
            .iter()
            .chain(attributes)
            .chain(children)
            .map(|&n| outline(tree, source_text, n))
            .collect(),
        Jsx::Attribute { name, value } => std::iter::once(name)
            .chain(value)
            .map(|n| outline(tree, source_text, n))
            .collect(),
        Jsx::Spread(n) | Jsx::Container(Some(n)) => vec![outline(tree, source_text, n)],
        Jsx::Namespaced { namespace, name } => vec![
            outline(tree, source_text, namespace),
            outline(tree, source_text, name),
        ],
        Jsx::Container(None) | Jsx::Text => Vec::new(),
    };
    let debug = format!("{jsx:?}");
    let variant: String = debug
        .chars()
        .take_while(char::is_ascii_alphanumeric)
        .collect();
    format!("{variant}{:?}({})", text(node), parts.join(" "))
}

/// The outline of the expression the first statement holds.
fn expression(source_text: &str) -> String {
    let (tree, statements) = tsx(source_text).unwrap_or_else(|e| panic!("{source_text}: {e}"));
    let Kind::ExpressionStatement(e) = tree.kind(statements[0]) else {
        panic!("an expression statement");
    };
    outline(&tree, source_text, e)
}

#[test]
fn an_element_holds_its_attributes_and_children() {
    assert_eq!(
        expression("<my-el a=\"x\" b={1} {...c} d:e>t {f}<br/><>g</>{}</my-el>;"),
        r#"Element"<my-el a=\"x\" b={1} {...c} d:e>t {f}<br/><>g</>{}</my-el>"("my-el" Attribute"a=\"x\""("a" "\"x\"") Attribute"b={1}"("b" Container"{1}"("1")) Spread"{...c}"("c") Attribute"d:e"(Namespaced"d:e"("d" "e")) Text"t "() Container"{f}"("f") Element"<br/>"("br") Element"<>g</>"(Text"g"()) Container"{}"())"#
    );
}

#[test]
fn text_is_not_read_as_code() {
    assert_eq!(
        expression("<p>don't // stop /* here</p>;"),
        r#"Element"<p>don't // stop /* here</p>"("p" Text"don't // stop /* here"())"#
    );
}

#[test]
fn a_member_name_is_a_reference_and_a_lowercase_name_is_not() {
    let source_text = "<a.B><div /><C /></a.B>;";
    let (tree, statements) = tsx(source_text).expect("parses");
    let Kind::ExpressionStatement(e) = tree.kind(statements[0]) else {
        panic!("an expression statement");
    };
    let mut names = Vec::new();
    let mut stack = vec![e];
    while let Some(n) = stack.pop() {
        if let Kind::Identifier(_) = tree.kind(n) {
            names.push(tree.name(n));
        }
        tree.for_each_child(n, |c| stack.push(c));
    }
    names.sort_unstable();
    assert_eq!(names, ["B", "C", "a"]);
}

#[test]
fn a_type_parameter_list_with_a_comma_or_extends_is_not_jsx() {
    for source_text in ["<T,>(x: T) => x;", "<T extends U>(x: T) => x;"] {
        let (tree, statements) = tsx(source_text).expect("parses");
        let Kind::ExpressionStatement(e) = tree.kind(statements[0]) else {
            panic!("an expression statement");
        };
        assert!(matches!(tree.kind(e), Kind::Arrow { .. }), "{source_text}");
    }
}

#[test]
fn a_closing_tag_must_match_its_opening_tag() {
    assert_eq!(
        tsx("<a></b>;").map(drop),
        Err("expected a closing tag for the element".to_owned())
    );
}
