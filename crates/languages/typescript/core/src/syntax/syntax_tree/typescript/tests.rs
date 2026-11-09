use rsvelte_kernel::source::positions::Span;

use crate::parser::parse_program;
use crate::syntax_tree::{Kind, SyntaxTree};

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
            Kind::ExportNamed(declaration) => tree.declared_type_name(declaration, source),
            _ => tree.declared_type_name(s, source),
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
