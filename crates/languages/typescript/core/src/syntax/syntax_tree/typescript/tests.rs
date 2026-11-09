use rsvelte_kernel::source::positions::Span;

use crate::parser::parse_program;
use crate::syntax_tree::{Control, Kind, SyntaxTree, TypeDeclarationKind};

fn parse(source: &str) -> (SyntaxTree, Vec<crate::NodeIdentifier>) {
    let mut tree = SyntaxTree::new();
    let program = parse_program(&mut tree, source, Span::new(0, source.len() as u32), true)
        .expect("the source parses");
    let Kind::Program(statements) = tree.kind(program) else {
        panic!("a program");
    };
    let statements = statements.to_vec();
    (tree, statements)
}

#[test]
fn a_type_declaration_records_its_name_and_kind() {
    let (tree, _) = parse(
        "type A = {};\ninterface B { x: 1 }\ninterface C extends D {}\ndeclare interface E {}\n\
         export type F<T> = T;\nenum G {}\nnamespace H {}\ndeclare type I = 1;\nlet j;",
    );
    let names: Vec<(&str, TypeDeclarationKind)> = tree
        .type_declarations
        .iter()
        .map(|d| (tree.atoms.get(d.name), d.kind))
        .collect();
    assert_eq!(
        names,
        [
            ("A", TypeDeclarationKind::Alias),
            ("B", TypeDeclarationKind::Interface),
            ("C", TypeDeclarationKind::Interface),
            ("E", TypeDeclarationKind::Interface),
            ("F", TypeDeclarationKind::Alias),
            ("G", TypeDeclarationKind::Enum),
            ("H", TypeDeclarationKind::Namespace),
            ("I", TypeDeclarationKind::Alias),
        ]
    );
}

#[test]
fn a_type_only_export_keeps_the_export_it_drops() {
    let source = "export type { A } from 'a';\nexport type * from 'b';\nexport type B = 1;";
    let (tree, statements) = parse(source);
    let sources: Vec<Option<&str>> = statements
        .iter()
        .map(|&s| match tree.kind(tree.exported_types(s)?) {
            Kind::Control(
                Control::ExportList {
                    source: Some(module),
                    ..
                }
                | Control::ExportAll { source: module, .. },
            ) => Some(tree.str_value(module, source)),
            _ => None,
        })
        .collect();
    assert_eq!(sources, [Some("a"), Some("b"), None]);
}

#[test]
fn a_namespace_body_records_its_type_declarations_as_nested() {
    let (tree, _) = parse(
        "namespace N { interface A {} namespace M { type B = 1; } }\n\
         declare global { interface C {} }\ndeclare module 'm' { enum D {} }\ntype E = 1;",
    );
    let names: Vec<(&str, bool)> = tree
        .type_declarations
        .iter()
        .map(|d| (tree.atoms.get(d.name), d.nested))
        .collect();
    assert_eq!(
        names,
        [
            ("N", false),
            ("A", true),
            ("M", true),
            ("B", true),
            ("C", true),
            ("D", true),
            ("E", false),
        ]
    );
}
