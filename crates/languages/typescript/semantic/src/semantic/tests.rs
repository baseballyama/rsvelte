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

/// What acorn reports for the first error of `text`'s analysis, a module read as acorn reads it,
/// where `unchecked` are the rules acorn does not check; `None` where it reads the module.
fn acorn_reports(
    text: &str,
    source_type: SourceType,
    unchecked: &'static [&'static str],
) -> Option<(String, u32)> {
    let (tree, program) = Tree::build(text, |builder| {
        builder.leave_unchecked(unchecked);
        builder.read_as_acorn();
        let range = rsvelte_kernel::source::positions::Span::new(0, text.len() as u32);
        builder.program(range, source_type).map_err(Into::into)
    })
    .expect("parses");
    let semantic = Semantic::program(tree, program);
    semantic
        .javascript_syntax_error()
        .map(|error| match &error.acorn {
            Some(rsvelte_typescript_tree::Acorn::Fails { message, at }) => {
                (message.to_string(), *at)
            }
            other => panic!("{text:?}: acorn fails, not {other:?}"),
        })
}

#[test]
fn acorn_tells_a_strict_name_declared_from_one_assigned() {
    for (text, message, at) in [
        ("function g(eval) {}", "Binding eval in strict mode", 11),
        ("try {} catch (eval) {}", "Binding eval in strict mode", 14),
        (
            "function arguments() {}",
            "Binding arguments in strict mode",
            9,
        ),
        ("[eval] = [1];", "Assigning to eval in strict mode", 1),
        ("eval++;", "Assigning to eval in strict mode", 0),
    ] {
        assert_eq!(
            acorn_reports(text, SourceType::mjs(), &[]),
            Some((message.to_owned(), at)),
            "{text:?}"
        );
    }
}

#[test]
fn acorn_reports_a_private_name_no_class_declares_and_await_in_a_static_block() {
    for (text, message, at) in [
        (
            "let o; o.#x;",
            "Private field '#x' must be declared in an enclosing class",
            9,
        ),
        (
            "class A { m() { return #x in this; } }",
            "Private field '#x' must be declared in an enclosing class",
            23,
        ),
        (
            "class A { static { await using x = null; } }",
            "Cannot use await in class static initialization block",
            19,
        ),
    ] {
        assert_eq!(
            acorn_reports(text, SourceType::mjs(), &[]),
            Some((message.to_owned(), at)),
            "{text:?}"
        );
    }
}

#[test]
fn acorn_reads_a_class_accessor_without_a_body_and_an_export_it_does_not_check() {
    assert_eq!(
        acorn_reports(
            "class K { get m(): number; get m() { return 1; } }",
            SourceType::ts(),
            &[]
        ),
        None
    );
    assert_eq!(
        acorn_reports("export { missing };", SourceType::mjs(), &["2304"]),
        None
    );
    // A host that does not read as acorn reports both.
    let (tree, program) = Tree::build("class K { get m(): number; }", |builder| {
        let range = rsvelte_kernel::source::positions::Span::new(0, 28);
        builder.program(range, SourceType::ts()).map_err(Into::into)
    })
    .expect("parses");
    assert!(Semantic::program(tree, program).syntax_error().is_some());
}
