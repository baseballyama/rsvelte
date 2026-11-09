use super::super::tests::typescript;
use crate::syntax_tree::{Control, Kind};

#[test]
fn an_export_specifier_may_be_type_only() {
    let source_text = "export { type A, type as, type B as C, type, type as D, type as as E, type as as } from 'm';";
    let (tree, statements) = typescript(source_text);
    let Kind::Control(Control::ExportList { specifiers, .. }) = tree.kind(statements[0]) else {
        panic!("an export list");
    };
    let text = |n| {
        tree.source_location(n)
            .span()
            .expect("located")
            .text(source_text)
    };
    let read: Vec<(&str, &str, bool)> = specifiers
        .iter()
        .map(|&s| {
            let Kind::Control(Control::ExportSpecifier {
                local, type_only, ..
            }) = tree.kind(s)
            else {
                panic!("a specifier");
            };
            (text(s), text(local), type_only)
        })
        .collect();
    assert_eq!(
        read,
        [
            ("type A", "A", true),
            ("type as", "as", true),
            ("type B as C", "B", true),
            ("type", "type", false),
            ("type as D", "type", false),
            ("type as as E", "as", true),
            ("type as as", "type", false),
        ]
    );
}

#[test]
fn an_export_from_a_module_may_have_attributes() {
    let source_text =
        "export * from 'm' with { type: 'json' };\nexport { a } from 'n' with { type: 'json' };";
    let (tree, statements) = typescript(source_text);
    let attributes: Vec<&str> = statements
        .iter()
        .map(|&s| {
            let Kind::Control(
                Control::ExportAll { attributes, .. } | Control::ExportList { attributes, .. },
            ) = tree.kind(s)
            else {
                panic!("an export");
            };
            tree.source_location(attributes.expect("attributes"))
                .span()
                .expect("located")
                .text(source_text)
        })
        .collect();
    assert_eq!(attributes, ["{ type: 'json' }", "{ type: 'json' }"]);
}
