//! TypeScript the parser accepts: what compilation erases, what it must refuse, and which type
//! names scope analysis sees. Printed and refused forms are the official compiler's (svelte 5.57.1
//! on the same statements in `<script lang="ts">`); which names count as references is
//! typescript-eslint's, checked through `no-unused-variables` in `rsvelte_svelte`'s lint tests.

use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript::parser::parse_program;
use rsvelte_typescript::syntax_tree::{SyntaxTree, TypeScriptFeature};
use rsvelte_typescript_compile::codegen::print_program;

fn parse(source_text: &str) -> (SyntaxTree, rsvelte_typescript::NodeIdentifier) {
    let mut syntax_tree = SyntaxTree::new();
    let p = parse_program(
        &mut syntax_tree,
        source_text,
        Span::new(0, source_text.len() as u32),
        true,
    )
    .unwrap_or_else(|e| panic!("{}: {:?}", e.message, e.span));
    (syntax_tree, p)
}

fn print(source_text: &str) -> String {
    let (syntax_tree, p) = parse(source_text);
    print_program(&syntax_tree, source_text, p).out
}

#[test]
fn type_arguments_are_erased_from_calls() {
    assert_eq!(print("let x = f<string>(\"a\");"), "let x = f(\"a\");\n");
    assert_eq!(print("let x = f<Array<string>>([]);"), "let x = f([]);\n");
    assert_eq!(
        print("let x = new Map<string, number>();"),
        "let x = new Map();\n"
    );
    // TypeScript reads a `<` … `>` pair before `(` as type arguments, whatever JavaScript would.
    assert_eq!(print("let x = a < b > (c);"), "let x = a(c);\n");
}

#[test]
fn a_comparison_stays_a_comparison() {
    assert_eq!(
        print("let x = a < b && c > (a);"),
        "let x = a < b && c > a;\n"
    );
}

#[test]
fn constructs_with_a_runtime_value_are_recorded() {
    let features = |source_text: &str| {
        let (syntax_tree, _) = parse(source_text);
        syntax_tree
            .typescript_runtime
            .iter()
            .map(|t| (t.feature, t.span.text(source_text).to_owned()))
            .collect::<Vec<_>>()
    };
    assert_eq!(
        features("enum Color { Red }\nlet x = 1;"),
        [(TypeScriptFeature::Enum, "enum Color { Red }".to_owned())]
    );
    assert_eq!(
        features("declare enum E { A }"),
        [(TypeScriptFeature::Enum, "declare enum E { A }".to_owned())]
    );
    assert_eq!(
        features("export enum E { A }"),
        [(TypeScriptFeature::Enum, "enum E { A }".to_owned())]
    );
    assert_eq!(
        features("namespace N { export type A = string; export interface B { b: number } }"),
        []
    );
    assert_eq!(
        features("namespace N { export const a = 1; }"),
        [(
            TypeScriptFeature::NamespaceWithValues,
            "namespace N { export const a = 1; }".to_owned()
        )]
    );
    // Upstream visits the body first, so an enum inside wins over the namespace.
    assert_eq!(
        features("namespace N { const q = 1; enum E { A } }"),
        [(TypeScriptFeature::Enum, "enum E { A }".to_owned())]
    );
}

#[test]
fn type_names_are_noted_but_keys_and_members_are_not() {
    let source_text = "let x: A.B<C, { d: D; e?: E }> = f<G>((h: H) => h);";
    let (syntax_tree, _) = parse(source_text);
    let names: Vec<&str> = syntax_tree
        .type_references
        .iter()
        .map(|r| r.span.text(source_text))
        .collect();
    assert_eq!(names, ["A", "C", "D", "E", "G", "H"]);
}

#[test]
fn an_interface_read_as_text_leaves_no_members_behind() {
    // `m(): void` is not a property signature, so the body is kept as text after `x` was read.
    let source_text = "interface A { x: number; m(): void }\nlet y = 1;";
    let (syntax_tree, p) = parse(source_text);
    let rsvelte_typescript::syntax_tree::Kind::Program(body) = syntax_tree.kind(p) else {
        panic!("not a program")
    };
    assert_eq!(body.len(), 2);
    assert_eq!(print(source_text), "let y = 1;\n");
}
