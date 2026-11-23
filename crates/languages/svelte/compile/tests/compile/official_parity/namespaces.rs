//! A namespace, module or global declaration: upstream's `remove_typescript_nodes` refuses one
//! whose block holds a value, under `declare` too.

use rsvelte_svelte_compile::{CompileOptions, compile};

/// A TypeScript script, and the code and offset in it of what svelte 5.57.3 and 5.59.1 raise in
/// runes mode, or `None` where it compiles.
const CASES: &[(&str, Option<(&str, u32)>)] = &[
    (
        "declare namespace N { const a: number; }",
        Some(("typescript_invalid_feature", 0)),
    ),
    (
        "declare namespace N { class C {} }",
        Some(("typescript_invalid_feature", 0)),
    ),
    (
        "declare namespace N { export const a: number; }",
        Some(("typescript_invalid_feature", 0)),
    ),
    (
        "declare namespace N { import x = y; }",
        Some(("typescript_invalid_feature", 0)),
    ),
    (
        "declare namespace A { namespace B { const a: number; } }",
        Some(("typescript_invalid_feature", 22)),
    ),
    (
        "declare namespace N { enum E { A } }",
        Some(("typescript_invalid_feature", 22)),
    ),
    (
        "declare module \"x\" { const a: number; }",
        Some(("typescript_invalid_feature", 0)),
    ),
    (
        "declare module M { const a: number; }",
        Some(("typescript_invalid_feature", 0)),
    ),
    (
        "declare global { var a: number; }",
        Some(("typescript_invalid_feature", 0)),
    ),
    (
        "namespace N { export const a = 1; }",
        Some(("typescript_invalid_feature", 0)),
    ),
    (
        "declare namespace N { export import A = B.C; }",
        Some(("typescript_invalid_feature", 0)),
    ),
    (
        "declare module 'x' { export import A = B.C; }",
        Some(("typescript_invalid_feature", 0)),
    ),
    (
        "declare global { export import A = B.C; }",
        Some(("typescript_invalid_feature", 0)),
    ),
    (
        "namespace N { export import A = B.C; }",
        Some(("typescript_invalid_feature", 0)),
    ),
    (
        "namespace N { export import A = require('x'); }",
        Some(("typescript_invalid_feature", 0)),
    ),
    (
        "declare namespace N { export enum E { A } }",
        Some(("typescript_invalid_feature", 29)),
    ),
    (
        "namespace N { declare namespace M { const a: number; } }",
        Some(("typescript_invalid_feature", 14)),
    ),
    (
        "namespace N { declare enum E { A } }",
        Some(("typescript_invalid_feature", 14)),
    ),
    (
        "namespace N { export declare let x: number; export const y = 1; }",
        Some(("typescript_invalid_feature", 0)),
    ),
    (
        "namespace N { export declare class C {} export class D {} }",
        Some(("typescript_invalid_feature", 0)),
    ),
    ("declare namespace N { export declare enum E { A } }", None),
    ("namespace N { export declare enum E { A } }", None),
    ("declare namespace N {}", None),
    ("declare namespace N { declare const a: number; }", None),
    ("declare namespace N { function f(): void; }", None),
    ("declare namespace N { export interface I {} }", None),
    ("declare namespace A { namespace B { type T = 1; } }", None),
    ("declare module \"x\" { type T = 1; }", None),
    ("declare module \"x\";", None),
    ("declare global { interface Window { a: 1 } }", None),
    ("export declare namespace N { const a: number; }", None),
];

#[test]
fn a_namespace_holding_a_value_is_refused_under_declare_too() {
    let open = "<script lang=\"ts\">";
    for &(script, expected) in CASES {
        let source = format!("{open}{script}</script>");
        let raised = compile(&source, &CompileOptions::default())
            .err()
            .map(|error| (error.code.to_string(), error.span.start_offset));
        let expected = expected.map(|(code, at)| (code.to_owned(), at + open.len() as u32));
        assert_eq!(raised, expected, "{source}");
    }
}
