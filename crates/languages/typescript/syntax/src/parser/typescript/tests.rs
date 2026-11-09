use super::super::tests::{entries, outline, typescript};
use crate::syntax_tree::{Kind, SyntaxTree, TypeScriptFeature};

/// Each statement as its kind and, for a TypeScript declaration, what it declares.
fn statements(source_text: &str) -> (SyntaxTree, Vec<String>) {
    let (tree, statements) = typescript(source_text);
    let outlines = statements
        .iter()
        .map(|&s| {
            tree.declaration(s).map_or_else(
                || {
                    let kind = format!("{:?}", tree.kind(s));
                    kind.chars()
                        .take_while(char::is_ascii_alphanumeric)
                        .collect()
                },
                |d| outline(&tree, source_text, d),
            )
        })
        .collect();
    (tree, outlines)
}

fn runtime<'s>(tree: &SyntaxTree, source_text: &'s str) -> Vec<(TypeScriptFeature, &'s str)> {
    tree.typescript_runtime
        .iter()
        .map(|r| (r.feature, r.span.text(source_text)))
        .collect()
}

#[test]
fn enums_are_declarations_with_a_runtime_value() {
    let source_text = "enum E { A = 1, 'B' }\nconst\nenum\nF { C }\ndeclare enum G {}";
    let (tree, outlines) = statements(source_text);
    assert_eq!(
        format!("{outlines:#?}"),
        r#"[
    "Enum\"enum E { A = 1, 'B' }\"(\"E\" EnumMember\"A = 1\"(\"A\" \"1\") EnumMember\"'B'\"(\"'B'\"))",
    "Enum\"enum\\nF { C }\"(\"F\" EnumMember\"C\"(\"C\"))",
    "Enum\"enum G {}\"(\"G\")",
]"#
    );
    assert_eq!(
        format!("{:?}", runtime(&tree, source_text)),
        r#"[(Enum, "enum E { A = 1, 'B' }"), (Enum, "const\nenum\nF { C }"), (Enum, "declare enum G {}")]"#
    );
}

#[test]
fn a_namespace_body_is_parsed_and_its_values_are_runtime() {
    let source_text = "namespace N.M { export const a = 1; }\n\
        declare module \"m\" { export function f(): void; }\n\
        declare global { interface W {} }";
    let (tree, outlines) = statements(source_text);
    assert_eq!(
        format!("{outlines:#?}"),
        r#"[
    "Module\"namespace N.M { export const a = 1; }\"(Qualified\"N.M\"(\"N\" \"M\") \"export const a = 1;\")",
    "Module\"module \\\"m\\\" { export function f(): void; }\"(\"\\\"m\\\"\" \"export function f(): void;\")",
    "Module\"global { interface W {} }\"(\"global\" \"interface W {}\")",
]"#
    );
    assert_eq!(
        format!("{:?}", runtime(&tree, source_text)),
        r#"[(NamespaceWithValues, "namespace N.M { export const a = 1; }")]"#
    );
}

#[test]
fn import_and_export_assignments_are_runtime_unless_type_only() {
    let source_text =
        "import x = require(\"m\");\nimport type y = N.M;\nexport = x;\nexport as namespace Lib;";
    let (tree, outlines) = statements(source_text);
    assert_eq!(
        format!("{outlines:#?}"),
        r#"[
    "ImportEquals\"import x = require(\\\"m\\\");\"(\"x\" External\"require(\\\"m\\\")\"(\"\\\"m\\\"\"))",
    "ImportEquals\"import type y = N.M;\"(\"y\" Qualified\"N.M\"(\"N\" \"M\"))",
    "ExportAssignment\"export = x;\"(\"x\")",
    "NamespaceExport\"export as namespace Lib;\"(\"Lib\")",
]"#
    );
    assert_eq!(
        format!("{:?}", runtime(&tree, source_text)),
        r#"[(ImportEquals, "import x = require(\"m\");"), (ExportAssignment, "export = x;")]"#
    );
}

#[test]
fn an_overload_is_a_function_without_a_body() {
    let source_text = "function f(a: string): void;\nfunction f(a) {}\ndeclare function g<T>(): T;";
    let (tree, statements) = typescript(source_text);
    let bodies: Vec<(bool, bool)> = statements
        .iter()
        .map(|&s| {
            let function = tree.declaration(s).unwrap_or(s);
            let Kind::Function { body, .. } = tree.kind(function) else {
                panic!("a function");
            };
            (tree.declaration(s).is_some(), body.opt().is_some())
        })
        .collect();
    assert_eq!(
        format!("{bodies:?}"),
        "[(true, false), (false, true), (true, false)]"
    );
    assert_eq!(
        format!("{:#?}", entries(&tree, source_text)),
        r#"[
    (
        Annotation,
        "string = Leaf\"string\"",
    ),
    (
        ReturnType,
        "void = Leaf\"void\"",
    ),
    (
        TypeParameters,
        "<T> = Parameters\"<T>\"(Parameter\"T\"(\"T\"))",
    ),
    (
        ReturnType,
        "T = Reference\"T\"(\"T\")",
    ),
]"#
    );
}

#[test]
fn a_definite_assignment_is_recorded_on_its_binding() {
    let source_text = "let b!: number;";
    let (tree, _) = typescript(source_text);
    assert_eq!(
        format!("{:?}", entries(&tree, source_text)),
        r#"[(Definite, "!"), (Annotation, "number = Leaf\"number\"")]"#
    );
}

#[test]
fn only_a_declaration_without_braces_ends_with_its_semicolon() {
    let (_, outlines) = statements("interface A {};\ntype B = 1\ndeclare module 'm';");
    assert_eq!(
        format!("{outlines:#?}"),
        r#"[
    "Interface\"interface A {}\"(\"A\")",
    "Empty",
    "Alias\"type B = 1\"(\"B\" Leaf\"1\")",
    "Module\"module 'm'\"(\"'m'\")",
]"#
    );
}
