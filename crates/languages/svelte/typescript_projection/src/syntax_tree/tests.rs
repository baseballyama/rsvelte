use super::{Node, SyntaxTree, TEXT_CHUNK};

#[test]
fn a_computed_string_reads_back_across_its_chunks() {
    let mut tree = SyntaxTree::default();
    let before = tree.push(Node::Boolean);
    for text in [
        "",
        "16",
        "é".repeat(TEXT_CHUNK).as_str(),
        &"9".repeat(TEXT_CHUNK * 2 + 1),
    ] {
        let literal = tree.computed_string_literal(text);
        let after = tree.push(Node::Boolean);
        let Node::ComputedStringLiteral { first, len } = tree.node(literal) else {
            panic!("{text:?} is not a computed string literal");
        };
        assert_eq!(tree.computed_text(first, len), text);
        assert!(matches!(tree.node(after), Node::Boolean));
    }
    assert!(matches!(tree.node(before), Node::Boolean));
}
