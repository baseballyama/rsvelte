use oxc_ast::ast::{Expression, Statement};
use oxc_span::{GetSpan, SourceType};
use rsvelte_kernel::source::document::Document;
use rsvelte_typescript_tree::{Tree, TypeScriptReader};

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

/// Whether a host whose parser is acorn rejects `text` after the parser, leaving `unchecked`
/// rules to the host.
fn rejects(text: &str, source_type: SourceType, unchecked: &'static [&'static str]) -> bool {
    let (tree, program) = Tree::build(text, |builder| {
        builder.leave_unchecked(Box::leak(Box::new(unchecked)));
        builder.read_as_acorn(TypeScriptReader::AcornTypescript);
        let range = rsvelte_kernel::source::positions::Span::new(0, text.len() as u32);
        builder.program(range, source_type).map_err(Into::into)
    })
    .expect("parses");
    Semantic::program(tree, program)
        .javascript_syntax_error()
        .is_some()
}

#[test]
fn a_strict_name_a_reserved_word_and_a_private_name_no_class_declares_are_rejected() {
    for text in [
        "function g(eval) {}",
        "try {} catch (eval) {}",
        "function arguments() {}",
        "[eval] = [1];",
        "eval++;",
        "let o; o.#x;",
        "class A { m() { return #x in this; } }",
        "class A { static { await using x = null; } }",
    ] {
        assert!(rejects(text, SourceType::mjs(), &[]), "{text:?}");
    }
    for text in [
        "\\u006cet;",
        "l\\u0065t;",
        "\\u{6c}et;",
        "y\\u0069eld;",
        "\\u0069mplements;",
        "var \\u0073tatic = 1;",
        "let \\u006cet = 1;",
        "function f(\\u006cet) {}",
        "var static = 1;",
    ] {
        for source_type in [SourceType::mjs(), SourceType::ts().with_module(true)] {
            assert!(rejects(text, source_type, &[]), "{text:?} {source_type:?}");
        }
    }
}

#[test]
fn acorn_reads_a_class_accessor_without_a_body_and_an_export_it_does_not_check() {
    assert!(!rejects(
        "class K { get m(): number; get m() { return 1; } }",
        SourceType::ts(),
        &[]
    ));
    assert!(!rejects(
        "export { missing };",
        SourceType::mjs(),
        &["2304"]
    ));
    // A host that does not read as acorn reports both.
    let (tree, program) = Tree::build("class K { get m(): number; }", |builder| {
        let range = rsvelte_kernel::source::positions::Span::new(0, 28);
        builder.program(range, SourceType::ts()).map_err(Into::into)
    })
    .expect("parses");
    assert!(Semantic::program(tree, program).syntax_error().is_some());
}

#[test]
fn a_type_alias_fails_only_where_a_type_declared_its_name_before() {
    for (text, rejected) in [
        ("type T = 1; type T = 2;", true),
        ("interface T {} type T = 1;", true),
        ("{ type T = 1; type T = 2; }", true),
        ("type T = 1; interface T {}", false),
        ("class T {} type T = 1;", false),
        ("enum T {} type T = 1;", false),
    ] {
        assert_eq!(rejects(text, SourceType::ts(), &[]), rejected, "{text:?}");
    }
}
