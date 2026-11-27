//! Type erasure and the TypeScript it refuses. Printed and refused forms are the official
//! compiler's (svelte 5.57.3 on the same statements in `<script lang="ts">`).

use oxc_allocator::{Allocator, CloneIn};
use oxc_ast_visit::VisitMut;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_typescript_compile::emit;
use rsvelte_typescript_compile::features::{
    Feature, first_erasure_feature, first_runtime_feature, first_svelte_runtime_feature_where,
};
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
    found(source_text, first_runtime_feature)
}

fn erasure_feature(source_text: &str) -> Option<(Feature, String)> {
    found(source_text, first_erasure_feature)
}

fn svelte_feature(source_text: &str) -> Option<(Feature, String)> {
    found(source_text, |program| {
        first_svelte_runtime_feature_where(program, |_| true)
    })
}

fn found(
    source_text: &str,
    find: fn(&oxc_ast::ast::Program<'_>) -> Option<(Feature, oxc_span::Span)>,
) -> Option<(Feature, String)> {
    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, source_text, SourceType::ts()).parse();
    find(&parsed.program).map(|(feature, span)| {
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
            "class A<T> extends B<T> implements C { declare x: T; y?: T; private z = 1; m(): void \
                {} n(): void; [k: string]: any }",
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

#[test]
fn svelte_refuses_the_namespace_around_an_import_equals_and_an_ambient_one_with_a_value() {
    let source_text = "namespace N { import A = require('m'); }";
    assert_eq!(
        svelte_feature(source_text),
        Some((Feature::NamespaceWithValues, source_text.to_owned()))
    );
    // Svelte 5.57.3 refuses these, though erasing their types leaves nothing.
    for source_text in [
        "declare namespace N { const a: number; }",
        "declare module 'm' { export const a: number; }",
        "declare global { const a: number; }",
    ] {
        assert_eq!(
            svelte_feature(source_text),
            Some((Feature::NamespaceWithValues, source_text.to_owned())),
            "{source_text}"
        );
        assert_eq!(feature(source_text), None, "{source_text}");
    }
}

#[test]
fn numbers_print_as_typescripts_emit_prints_them() {
    // TypeScript 6.0.3's `transpileModule`: `canUseOriginalText`'s cases, in a module and a script.
    let kept =
        "0x10, 0X1F, 0B11, 0O17, 1e3, 1E3, 1.50, .5, 5., 0, 1_000, 0b1_1, 0o1_7, 0x1_0, 1_0.5";
    for (written, printed) in [
        ("010, 0777", "8, 511"),
        ("08, 09.5, 08e1, 00", "8, 9.5, 80, 0"),
        (
            "10n, 1_0n, 0b11n, 0o7n, 0x1fn, 0X1_Fn",
            "10n, 10n, 3n, 7n, 0x1fn, 0x1fn",
        ),
        (kept, kept),
    ] {
        for declaration in ["export const x", "const x"] {
            let allocator = Allocator::default();
            let source_text = format!("{declaration} = [{written}];\n");
            let parsed = Parser::new(&allocator, &source_text, SourceType::ts()).parse();
            assert!(parsed.diagnostics.is_empty(), "{:?}", parsed.diagnostics);
            let words = |text: &str| text.split_whitespace().collect::<String>();
            let expected = words(&format!("{declaration} = [{printed}];"));
            assert_eq!(words(&emit(&parsed.program)), expected, "{source_text}");
        }
    }
}

#[test]
fn a_number_a_property_access_follows_prints_as_typescripts_emit_prints_it() {
    // TypeScript 6.0.3's `transpileModule`, which writes `mayNeedDotDotForPropertyAccess`'s dot.
    for (written, printed) in [
        ("1 .toString()", "1..toString()"),
        ("1_0 .x", "1_0..x"),
        ("10 .x", "10..x"),
        ("0 .x", "0..x"),
        ("1..toString()", "1..toString()"),
        ("1.0.toString()", "1.0.toString()"),
        ("1.5.x", "1.5.x"),
        (".5.x", ".5.x"),
        ("5..x", "5..x"),
        ("1e3.x", "1e3.x"),
        ("1E3.x", "1E3.x"),
        ("0x10.x", "0x10.x"),
        ("0X10.x", "0X10.x"),
        ("0b1.x", "0b1.x"),
        ("0o7.x", "0o7.x"),
        ("1n.x", "1n.x"),
        ("08 .x", "8..x"),
        ("010 .x", "8..x"),
        ("1 ?.x", "1?.x"),
        ("1 [\"x\"]", "1[\"x\"]"),
        ("1 .x()", "1..x()"),
        ("-1 .x", "-1..x"),
        ("1 .x.y", "1..x.y"),
    ] {
        for declaration in ["export const a", "const a"] {
            let allocator = Allocator::default();
            let source_text = format!("{declaration} = {written};\n");
            let parsed = Parser::new(&allocator, &source_text, SourceType::ts()).parse();
            assert!(parsed.diagnostics.is_empty(), "{:?}", parsed.diagnostics);
            let expected = format!("{declaration} = {printed};\n");
            assert_eq!(emit(&parsed.program), expected, "{source_text}");
        }
    }
}

/// A source written around a number.
type Shape = fn(&str) -> String;

#[test]
fn a_number_in_parentheses_or_before_a_comment_or_a_line_break_gets_no_second_dot() {
    // TypeScript 6.0.3's `transpileModule`: `shouldEmitDotDot` writes the second dot after each
    // of these numbers only where nothing but white space that is not a line break comes before
    // the dot.
    let numbers = [
        "1",
        "0",
        "9007199254740993",
        "1_000",
        "010",
        "08",
        "100000000000000000000",
    ];
    let shapes: [(Shape, bool); 15] = [
        (|n| format!("({n}).x"), false),
        (|n| format!("({n} ).x"), false),
        (|n| format!("{n}\n.x"), false),
        (|n| format!("{n}\r.x"), false),
        (|n| format!("{n}\r\n.x"), false),
        (|n| format!("{n}\u{2028}.x"), false),
        (|n| format!("{n}\u{2029}.x"), false),
        (|n| format!("{n} /*c*/ .x"), false),
        (|n| format!("{n} // c\n.x"), false),
        (|n| format!("{n}\t.x"), true),
        (|n| format!("{n}\u{b}.x"), true),
        (|n| format!("{n}\u{c}.x"), true),
        (|n| format!("{n}\u{a0}.x"), true),
        (|n| format!("{n}\u{feff}.x"), true),
        (|n| format!("{n}\u{3000}.x"), true),
    ];
    for number in numbers {
        for (shape, dotted) in shapes {
            for declaration in ["export const a", "const a"] {
                let allocator = Allocator::default();
                let source_text = format!("{declaration} = {};\n", shape(number));
                let parsed = Parser::new(&allocator, &source_text, SourceType::ts()).parse();
                assert!(parsed.diagnostics.is_empty(), "{:?}", parsed.diagnostics);
                let emitted = emit(&parsed.program);
                assert_eq!(
                    emitted.contains(".."),
                    dotted,
                    "{source_text:?} {emitted:?}"
                );
            }
        }
    }
}

#[test]
fn an_ambient_enum_is_erased_and_instantiates_its_namespace() {
    // TypeScript 6.0.3's `transpileModule` removes each, and keeps what follows.
    for (typescript, erased) in [
        (
            "declare enum E { A }\nexport const x = 1;",
            "export const x = 1;",
        ),
        (
            "declare const enum E { A }\nexport let E = 1;",
            "export let E = 1;",
        ),
        (
            "declare enum E { A }\nexport const x = E;",
            "export const x = E;",
        ),
        ("{ declare enum E { A } }\nlet x = 1;", "{} let x = 1;"),
        ("function f() { declare enum E { A } }", "function f() {}"),
        (
            "namespace N { declare namespace M { type T = 1; } }\nlet x = 1;",
            "let x = 1;",
        ),
    ] {
        assert_eq!(erasure_feature(typescript), None, "{typescript}");
        assert_eq!(erase(typescript), javascript(erased), "{typescript}");
    }
    // TypeScript emits a namespace that holds an enum or a value, `declare` or not, here or in a
    // nested namespace, which erasing types cannot.
    for typescript in [
        "namespace N { declare enum E { A } }",
        "namespace N { export declare const enum E { A } }",
        "namespace N { declare const x: number; }",
        "namespace N { declare namespace M { enum E { A } } }",
    ] {
        assert_eq!(
            erasure_feature(typescript),
            Some((Feature::NamespaceWithValues, typescript.to_owned())),
            "{typescript}"
        );
    }
    // A caller that prints what is left, and Svelte 5.59.1's `remove_typescript_nodes`, refuse it.
    for find in [feature, svelte_feature] {
        assert_eq!(
            find("declare enum E { A }"),
            Some((Feature::Enum, "declare enum E { A }".to_owned()))
        );
    }
}
