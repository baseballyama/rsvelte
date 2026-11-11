//! Type erasure and the TypeScript it refuses. Printed and refused forms are the official
//! compiler's (svelte 5.57.3 on the same statements in `<script lang="ts">`).

use oxc_allocator::{Allocator, CloneIn};
use oxc_ast_visit::VisitMut;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_typescript_compile::features::{Feature, first_runtime_feature};
use rsvelte_typescript_compile::print::print;
use rsvelte_typescript_compile::strip::Strip;

fn erase(source_text: &str) -> String {
    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, source_text, SourceType::ts()).parse();
    assert!(parsed.diagnostics.is_empty(), "{:?}", parsed.diagnostics);
    let output = Allocator::default();
    let mut program = parsed.program.clone_in(&output);
    Strip::new(&output).visit_program(&mut program);
    print(&program)
}

/// Prints JavaScript the way [`erase`] does, so a test states its expectation as source.
fn javascript(source_text: &str) -> String {
    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, source_text, SourceType::mjs()).parse();
    assert!(parsed.diagnostics.is_empty(), "{:?}", parsed.diagnostics);
    print(&parsed.program)
}

fn feature(source_text: &str) -> Option<(Feature, String)> {
    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, source_text, SourceType::ts()).parse();
    first_runtime_feature(&parsed.program).map(|(feature, span)| {
        (
            feature,
            source_text[span.start as usize..span.end as usize].to_owned(),
        )
    })
}

#[test]
fn types_are_erased() {
    for (typescript, erased) in [
        ("let x = f<string>(\"a\");", "let x = f(\"a\");"),
        ("let x = new Map<string, number>();", "let x = new Map();"),
        ("let x = a < b > (c);", "let x = a(c);"),
        ("let x = a < b && c > (a);", "let x = a < b && c > a;"),
        ("let x: number = (y as any)!;", "let x = y;"),
        ("(x as any).y = 1; x! = 2;", "x.y = 1; x = 2;"),
        ("a?.b!.c;", "a?.b.c;"),
        (
            "function f<T>(this: T, a?: T, ...b: T[]): T {}",
            "function f(a, ...b) {}",
        ),
        ("const g = <T,>(a: T): T => a;", "const g = (a) => a;"),
        ("let y!: number;", "let y;"),
        (
            "class A<T> extends B<T> implements C { declare x: T; y?: T; private z = 1; m(): void {} n(): void; [k: string]: any }",
            "class A extends B { y; z = 1; m() {} }",
        ),
        (
            "abstract class A { abstract m(): void; abstract p: number; }",
            "class A {}",
        ),
        ("try {} catch (e: unknown) {}", "try {} catch (e) {}"),
    ] {
        assert_eq!(erase(typescript), javascript(erased), "{typescript}");
    }
}

#[test]
fn type_only_statements_are_removed() {
    let typescript = "\
        import type A from 'a';\n\
        import { type B } from 'b';\n\
        import { type C, D } from 'c';\n\
        import {} from 'e';\n\
        export type { F } from 'f';\n\
        export { type G };\n\
        export interface H {}\n\
        export type I = string;\n\
        interface J { j: number }\n\
        type K = string;\n\
        declare const l: number;\n\
        declare function m(): void;\n\
        function n(): void;\n\
        function n() {}\n\
        namespace O { export type P = string; }\n\
        declare module 'q' {}\n\
        export default interface R {}\n\
        let s = 1;";
    assert_eq!(
        erase(typescript),
        javascript("import { D } from 'c'; import {} from 'e'; function n() {} let s = 1;")
    );
}

#[test]
fn constructs_with_a_runtime_value_are_found() {
    assert_eq!(
        feature("enum Color { Red }\nlet x = 1;"),
        Some((Feature::Enum, "enum Color { Red }".to_owned()))
    );
    assert_eq!(
        feature("export enum E { A }"),
        Some((Feature::Enum, "enum E { A }".to_owned()))
    );
    assert_eq!(
        feature("namespace N { export type A = string; export interface B { b: number } }"),
        None
    );
    assert_eq!(
        feature("namespace N { export const a = 1; }"),
        Some((
            Feature::NamespaceWithValues,
            "namespace N { export const a = 1; }".to_owned()
        ))
    );
    // Upstream visits the body first, so an enum inside wins over the namespace.
    assert_eq!(
        feature("namespace N { const q = 1; enum E { A } }"),
        Some((Feature::Enum, "enum E { A }".to_owned()))
    );
    assert_eq!(
        feature("class A { constructor(private a) {} }"),
        Some((Feature::ParameterProperty, "private a".to_owned()))
    );
    assert_eq!(
        feature("class A { accessor a = 1 }"),
        Some((Feature::Accessor, "accessor a = 1".to_owned()))
    );
    assert_eq!(
        feature("@d class A {}"),
        Some((Feature::Decorator, "@d".to_owned()))
    );
    assert_eq!(
        feature("import a = require('a');"),
        Some((Feature::ImportEquals, "import a = require('a');".to_owned()))
    );
}
