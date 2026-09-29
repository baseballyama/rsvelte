//! TypeScript the parser accepts: what compilation erases, what it must refuse, and which type
//! names scope analysis sees. Printed and refused forms are the official compiler's (svelte 5.57.1
//! on the same statements in `<script lang="ts">`); which names count as references is
//! typescript-eslint's, checked through `no-unused-vars` in `rsv_svelte`'s lint tests.

use rsv_js::ast::{Ast, TsFeature};
use rsv_js::codegen::print_program;
use rsv_js::parser::parse_program;
use rsv_kernel::source::Span;

fn parse(src: &str) -> (Ast, rsv_js::NodeId) {
    let mut ast = Ast::new();
    let p = parse_program(&mut ast, src, Span::new(0, src.len() as u32), true)
        .unwrap_or_else(|e| panic!("{}: {:?}", e.message, e.span));
    (ast, p)
}

fn print(src: &str) -> String {
    let (ast, p) = parse(src);
    print_program(&ast, src, p).out
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
    let features = |src: &str| {
        let (ast, _) = parse(src);
        ast.ts_runtime
            .iter()
            .map(|t| (t.feature, t.span.text(src).to_owned()))
            .collect::<Vec<_>>()
    };
    assert_eq!(
        features("enum Color { Red }\nlet x = 1;"),
        [(TsFeature::Enum, "enum Color { Red }".to_owned())]
    );
    assert_eq!(
        features("declare enum E { A }"),
        [(TsFeature::Enum, "declare enum E { A }".to_owned())]
    );
    assert_eq!(
        features("export enum E { A }"),
        [(TsFeature::Enum, "enum E { A }".to_owned())]
    );
    assert_eq!(
        features("namespace N { export type A = string; export interface B { b: number } }"),
        []
    );
    assert_eq!(
        features("namespace N { export const a = 1; }"),
        [(
            TsFeature::NamespaceWithValues,
            "namespace N { export const a = 1; }".to_owned()
        )]
    );
    // Upstream visits the body first, so an enum inside wins over the namespace.
    assert_eq!(
        features("namespace N { const q = 1; enum E { A } }"),
        [(TsFeature::Enum, "enum E { A }".to_owned())]
    );
}

#[test]
fn type_names_are_noted_but_keys_and_members_are_not() {
    let src = "let x: A.B<C, { d: D; e?: E }> = f<G>((h: H) => h);";
    let (ast, _) = parse(src);
    let names: Vec<&str> = ast.type_refs.iter().map(|r| r.span.text(src)).collect();
    assert_eq!(names, ["A", "C", "D", "E", "G", "H"]);
}
