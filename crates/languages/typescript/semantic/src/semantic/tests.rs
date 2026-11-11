use oxc_ast::ast::{Expression, Statement};
use oxc_span::{GetSpan, SourceType};
use rsvelte_kernel::source::document::Document;
use rsvelte_typescript_tree::Tree;

use super::Semantic;

#[test]
fn the_trees_nodes_carry_the_analysis() {
    let document = Document::new("a.ts".to_owned(), "let a = 1; a + b;".to_owned()).expect("small");
    let (tree, program) = Tree::program(&document, SourceType::ts()).expect("parses");
    let semantic = Semantic::program(tree, program);
    let scoping = semantic.scoping();
    let a = scoping
        .get_binding(scoping.root_scope_id(), "a".into())
        .expect("declared");

    let Statement::ExpressionStatement(statement) = &semantic.tree().get_program(program).body[1]
    else {
        unreachable!()
    };
    let Expression::BinaryExpression(sum) = &statement.expression else {
        unreachable!()
    };
    let (Expression::Identifier(left), Expression::Identifier(right)) = (&sum.left, &sum.right)
    else {
        unreachable!()
    };
    assert_eq!(
        scoping.get_reference(left.reference_id()).symbol_id(),
        Some(a)
    );
    assert_eq!(
        scoping.get_reference(right.reference_id()).symbol_id(),
        None
    );
    assert_eq!(
        semantic.nodes().parent_kind(left.node_id()).span(),
        sum.span
    );
}

#[test]
fn a_dropped_analysis_gives_its_scoping_arena_back() {
    let document = Document::new("a.ts".to_owned(), "let a = 1;".to_owned()).expect("small");
    let (tree, program) = Tree::program(&document, SourceType::ts()).expect("parses");
    drop(Semantic::program(tree, program));

    // A new arena has no capacity.
    assert!(super::SCOPINGS.take().capacity() > 0);
}
