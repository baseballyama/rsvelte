//! `eval` and `arguments` where acorn checks a name in strict mode: the name of a declaration
//! or an import, and the parameters of a function with a body, in an ambient context too.

use rsvelte_svelte_compile::{CompileOptions, compile};

/// A TypeScript script, and acorn's message and its offset in the script, from svelte 5.57.3 and
/// 5.59.1 in runes mode, or `None` where it compiles.
const CASES: &[(&str, Option<(&str, u32)>)] = &[
    (
        "declare namespace eval {}",
        Some(("Binding eval in strict mode", 18)),
    ),
    (
        "declare namespace arguments {}",
        Some(("Binding arguments in strict mode", 18)),
    ),
    (
        "declare module eval {}",
        Some(("Binding eval in strict mode", 15)),
    ),
    (
        "declare module arguments {}",
        Some(("Binding arguments in strict mode", 15)),
    ),
    (
        "declare function eval(): void;",
        Some(("Assigning to eval in strict mode", 17)),
    ),
    (
        "declare function arguments(): void;",
        Some(("Assigning to arguments in strict mode", 17)),
    ),
    (
        "declare class eval {}",
        Some(("Binding eval in strict mode", 14)),
    ),
    (
        "declare class arguments {}",
        Some(("Binding arguments in strict mode", 14)),
    ),
    (
        "declare enum eval {}",
        Some(("Binding eval in strict mode", 13)),
    ),
    (
        "declare enum arguments {}",
        Some(("Binding arguments in strict mode", 13)),
    ),
    (
        "declare const enum eval {}",
        Some(("Binding eval in strict mode", 19)),
    ),
    (
        "declare const enum arguments {}",
        Some(("Binding arguments in strict mode", 19)),
    ),
    (
        "declare interface eval {}",
        Some(("Binding eval in strict mode", 18)),
    ),
    (
        "declare interface arguments {}",
        Some(("Binding arguments in strict mode", 18)),
    ),
    (
        "declare type eval = 1;",
        Some(("Binding eval in strict mode", 13)),
    ),
    (
        "declare type arguments = 1;",
        Some(("Binding arguments in strict mode", 13)),
    ),
    (
        "declare namespace N { function eval(): void; }",
        Some(("Assigning to eval in strict mode", 31)),
    ),
    (
        "declare namespace N { class eval {} }",
        Some(("Binding eval in strict mode", 28)),
    ),
    (
        "declare namespace N { namespace eval {} }",
        Some(("Binding eval in strict mode", 32)),
    ),
    (
        "declare namespace N { interface eval {} }",
        Some(("Binding eval in strict mode", 32)),
    ),
    (
        "declare namespace N { type eval = 1; }",
        Some(("Binding eval in strict mode", 27)),
    ),
    (
        "declare namespace N { enum eval {} }",
        Some(("Binding eval in strict mode", 27)),
    ),
    (
        "declare namespace N { import eval = M.K; }",
        Some(("Binding eval in strict mode", 29)),
    ),
    ("declare function f(eval: number): void;", None),
    ("declare function f(arguments: number): void;", None),
    ("declare function f(...eval): void;", None),
    ("declare function f(...arguments): void;", None),
    (
        "declare namespace N { let eval: number; }",
        Some(("Binding eval in strict mode", 26)),
    ),
    ("declare class C { m(eval: number): void; }", None),
    ("declare class C { m(arguments: number): void; }", None),
    ("declare function f<eval>(): void;", None),
    ("declare function f<arguments>(): void;", None),
    (
        "interface eval {}",
        Some(("Binding eval in strict mode", 10)),
    ),
    (
        "interface arguments {}",
        Some(("Binding arguments in strict mode", 10)),
    ),
    ("type eval = 1;", Some(("Binding eval in strict mode", 5))),
    (
        "type arguments = 1;",
        Some(("Binding arguments in strict mode", 5)),
    ),
    ("enum eval {}", Some(("Binding eval in strict mode", 5))),
    (
        "enum arguments {}",
        Some(("Binding arguments in strict mode", 5)),
    ),
    (
        "declare namespace eval.N {}",
        Some(("Binding eval in strict mode", 18)),
    ),
    (
        "declare namespace arguments.N {}",
        Some(("Binding arguments in strict mode", 18)),
    ),
    (
        "declare module \"x\" { function eval(): void; }",
        Some(("Assigning to eval in strict mode", 30)),
    ),
    (
        "declare abstract class eval {}",
        Some(("Binding eval in strict mode", 23)),
    ),
    (
        "declare abstract class arguments {}",
        Some(("Binding arguments in strict mode", 23)),
    ),
    (
        "export declare function eval(): void;",
        Some(("Assigning to eval in strict mode", 24)),
    ),
    (
        "export declare function arguments(): void;",
        Some(("Assigning to arguments in strict mode", 24)),
    ),
    (
        "export declare class eval {}",
        Some(("Binding eval in strict mode", 21)),
    ),
    (
        "export declare class arguments {}",
        Some(("Binding arguments in strict mode", 21)),
    ),
    (
        "declare namespace N { export function eval(): void; }",
        Some(("Assigning to eval in strict mode", 38)),
    ),
    (
        "declare global { function eval(): void; }",
        Some(("Assigning to eval in strict mode", 26)),
    ),
    (
        "function eval(): void; function eval() {}",
        Some(("Assigning to eval in strict mode", 9)),
    ),
    (
        "function arguments(): void; function arguments() {}",
        Some(("Assigning to arguments in strict mode", 9)),
    ),
    (
        "declare namespace N { function eval(): void; function eval(): void; }",
        Some(("Assigning to eval in strict mode", 31)),
    ),
    ("declare class C { eval: number; }", None),
    ("declare class C { arguments: number; }", None),
    (
        "declare namespace N { var eval: number; }",
        Some(("Binding eval in strict mode", 26)),
    ),
    ("declare function f({ eval }: any): void;", None),
    ("declare function f({ arguments }: any): void;", None),
    (
        "declare const a = (eval) => 1;",
        Some(("Binding eval in strict mode", 19)),
    ),
    (
        "declare function eval(): void; declare const a = f();",
        Some(("Assigning to eval in strict mode", 17)),
    ),
    (
        "declare namespace eval.N {}",
        Some(("Binding eval in strict mode", 18)),
    ),
    (
        "import eval = M.K;",
        Some(("Binding eval in strict mode", 7)),
    ),
    (
        "declare module eval {}",
        Some(("Binding eval in strict mode", 15)),
    ),
    (
        "declare function eval(): void; let 1x;",
        Some(("Assigning to eval in strict mode", 17)),
    ),
];

#[test]
fn eval_and_arguments_are_checked_where_acorn_checks_a_name() {
    let open = "<script lang=\"ts\">";
    for &(script, expected) in CASES {
        let source = format!("{open}{script}</script>");
        let raised = compile(&source, &CompileOptions::default())
            .err()
            .map(|error| {
                let message = error.message.lines().next().map(str::to_owned);
                (error.code.to_string(), message, error.span.start_offset)
            });
        let expected = expected.map(|(message, at)| {
            let at = at + open.len() as u32;
            ("js_parse_error".to_owned(), Some(message.to_owned()), at)
        });
        assert_eq!(raised, expected, "{source}");
    }
}
