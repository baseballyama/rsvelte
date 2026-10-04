use rsvelte_kernel::source::positions::{SourceLocation, Span};
use rsvelte_typescript::operators::BinaryOperator;
use rsvelte_typescript::parser::parse_program;
use rsvelte_typescript::syntax_tree::{Kind, NodeIdentifier, SyntaxTree};
use rsvelte_typescript_compile::codegen::print_expression;

fn binary_children(
    tree: &SyntaxTree,
    node: NodeIdentifier,
    expected: BinaryOperator,
) -> (NodeIdentifier, NodeIdentifier) {
    let Kind::Binary(operator, left, right) = tree.kind(node) else {
        panic!("expected binary expression, got {:?}", tree.kind(node));
    };
    assert_eq!(operator, expected, "printing changed the binary operator");
    (left, right)
}

#[test]
fn generated_binary_trees_keep_their_shape_when_printed() {
    for &outer in BinaryOperator::ALL {
        for &inner in BinaryOperator::ALL {
            for nest_left in [true, false] {
                let mut tree = SyntaxTree::new();
                let a = tree.identifier("a");
                let b = tree.identifier("b");
                let c = tree.identifier("c");
                let nested = tree.binary(inner, a, b, SourceLocation::SYNTHETIC);
                let (left, right) = if nest_left { (nested, c) } else { (c, nested) };
                let expression = tree.binary(outer, left, right, SourceLocation::SYNTHETIC);
                let text = print_expression(&tree, "", expression);
                let mut parsed = SyntaxTree::new();
                let program =
                    parse_program(&mut parsed, &text, Span::new(0, text.len() as u32), false)
                        .expect("printed expression must parse");
                let Kind::Program(body) = parsed.kind(program) else {
                    panic!("expected program");
                };
                assert_eq!(body.len(), 1, "{text}");
                let Kind::ExpressionStatement(expression) = parsed.kind(body[0]) else {
                    panic!("expected expression statement");
                };
                let (left, right) = binary_children(&parsed, expression, outer);
                let (nested, other) = if nest_left {
                    (left, right)
                } else {
                    (right, left)
                };
                let (a, b) = binary_children(&parsed, nested, inner);
                assert_eq!(parsed.name(a), "a", "{text}");
                assert_eq!(parsed.name(b), "b", "{text}");
                assert_eq!(parsed.name(other), "c", "{text}");
            }
        }
    }
}
