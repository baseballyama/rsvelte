use rsvelte_kernel::source::positions::Span;

use crate::parser::parse_program;
use crate::syntax_tree::{Control, Kind, SyntaxTree, TypeScriptDeclared};

#[test]
fn a_type_alias_or_an_interface_names_what_it_declares() {
    let source = "type A = {};\ninterface B { x: 1 }\ninterface C extends D {}\n\
                  declare interface E {}\nexport type F<T> = T;\nenum G {}\nnamespace H {}\nlet i;";
    let mut tree = SyntaxTree::new();
    let program = parse_program(&mut tree, source, Span::new(0, source.len() as u32), true)
        .expect("the source parses");
    let Kind::Program(statements) = tree.kind(program) else {
        panic!("a program");
    };
    let names: Vec<Option<&str>> = statements
        .iter()
        .map(|&s| match tree.kind(s) {
            Kind::ExportNamed(declaration) => tree.declared_type_name(declaration),
            _ => tree.declared_type_name(s),
        })
        .collect();
    assert_eq!(
        names,
        [
            Some("A"),
            Some("B"),
            Some("C"),
            Some("E"),
            Some("F"),
            None,
            None,
            None
        ]
    );
}

#[test]
fn a_type_only_export_keeps_the_export_it_drops() {
    let source = "export type { A } from 'a';\nexport type * from 'b';\nexport type B = 1;";
    let mut tree = SyntaxTree::new();
    let program = parse_program(&mut tree, source, Span::new(0, source.len() as u32), true)
        .expect("the source parses");
    let Kind::Program(statements) = tree.kind(program) else {
        panic!("a program");
    };
    let sources: Vec<Option<&str>> = statements
        .iter()
        .map(|&s| match tree.typescript_declared(s) {
            Some(TypeScriptDeclared::TypeExport(export)) => match tree.kind(export) {
                Kind::Control(
                    Control::ExportList {
                        source: Some(module),
                        ..
                    }
                    | Control::ExportAll { source: module, .. },
                ) => Some(tree.str_value(module, source)),
                _ => None,
            },
            _ => None,
        })
        .collect();
    assert_eq!(sources, [Some("a"), Some("b"), None]);
}
