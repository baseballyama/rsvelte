//! A reserved word acorn refuses as a name in an ambient context, where oxc checks none, and a
//! class field's initializer there, which acorn reports at its `=`.

use super::outcomes::assert_component_outcomes;

const AMBIENT: &str = "Initializers are not allowed in ambient contexts.";
const AWAIT: &str = "Cannot use keyword 'await' outside an async function";

/// A TypeScript script, and acorn's message and its offset in the script, from svelte 5.57.3 and
/// 5.59.1 in runes mode, or `None` where it compiles.
const CASES: &[(&str, Option<(&str, u32)>)] = &[
    (
        "declare namespace static {}",
        Some(("The keyword 'static' is reserved", 18)),
    ),
    (
        "declare namespace yield {}",
        Some(("The keyword 'yield' is reserved", 18)),
    ),
    (
        "declare namespace let {}",
        Some(("The keyword 'let' is reserved", 18)),
    ),
    ("declare namespace await {}", Some((AWAIT, 18))),
    (
        "declare namespace implements {}",
        Some(("The keyword 'implements' is reserved", 18)),
    ),
    (
        "declare module static {}",
        Some(("The keyword 'static' is reserved", 15)),
    ),
    ("declare module await {}", Some((AWAIT, 15))),
    (
        "declare function static(): void;",
        Some(("The keyword 'static' is reserved", 17)),
    ),
    ("declare function await(): void;", Some((AWAIT, 17))),
    (
        "declare class static {}",
        Some(("The keyword 'static' is reserved", 14)),
    ),
    ("declare class await {}", Some((AWAIT, 14))),
    (
        "declare enum static {}",
        Some(("The keyword 'static' is reserved", 13)),
    ),
    ("declare enum await {}", Some((AWAIT, 13))),
    (
        "declare interface static {}",
        Some(("The keyword 'static' is reserved", 18)),
    ),
    ("declare interface await {}", Some((AWAIT, 18))),
    (
        "declare type static = 1;",
        Some(("The keyword 'static' is reserved", 13)),
    ),
    ("declare type await = 1;", Some((AWAIT, 13))),
    (
        "declare let static: number;",
        Some(("The keyword 'static' is reserved", 12)),
    ),
    ("declare let await: number;", Some((AWAIT, 12))),
    (
        "declare const static: number;",
        Some(("The keyword 'static' is reserved", 14)),
    ),
    ("declare const await: number;", Some((AWAIT, 14))),
    (
        "declare function f(static: number): void;",
        Some(("The keyword 'static' is reserved", 19)),
    ),
    (
        "declare function f(await: number): void;",
        Some((AWAIT, 19)),
    ),
    (
        "declare function f(...static): void;",
        Some(("The keyword 'static' is reserved", 22)),
    ),
    ("declare function f(...await): void;", Some((AWAIT, 22))),
    (
        "declare function f({ static }: any): void;",
        Some(("The keyword 'static' is reserved", 21)),
    ),
    (
        "declare function f({ await }: any): void;",
        Some((AWAIT, 21)),
    ),
    (
        "declare function f<static>(): void;",
        Some(("The keyword 'static' is reserved", 19)),
    ),
    ("declare function f<await>(): void;", Some((AWAIT, 19))),
    ("declare let a: static;", None),
    ("declare let a: await;", None),
    ("declare let a: typeof static;", None),
    ("declare let a: typeof await;", None),
    (
        "declare namespace N { function static(): void; }",
        Some(("The keyword 'static' is reserved", 31)),
    ),
    (
        "declare namespace N { let static: number; }",
        Some(("The keyword 'static' is reserved", 26)),
    ),
    (
        "declare namespace N { import static = M.K; }",
        Some(("The keyword 'static' is reserved", 29)),
    ),
    (
        "declare namespace N { import Y = static.K; }",
        Some(("The keyword 'static' is reserved", 33)),
    ),
    ("declare class C { static: number; }", None),
    ("declare class C { await: number; }", None),
    (
        "declare class C { m(static: number): void; }",
        Some(("The keyword 'static' is reserved", 20)),
    ),
    (
        "declare class C { m(await: number): void; }",
        Some((AWAIT, 20)),
    ),
    (
        "declare namespace N.static {}",
        Some(("The keyword 'static' is reserved", 20)),
    ),
    ("declare namespace N.await {}", Some((AWAIT, 20))),
    (
        "declare global { let static: number; }",
        Some(("The keyword 'static' is reserved", 21)),
    ),
    (
        "export declare function static(): void;",
        Some(("The keyword 'static' is reserved", 24)),
    ),
    ("export declare function await(): void;", Some((AWAIT, 24))),
    (
        "declare let a: (static: number) => void;",
        Some(("The keyword 'static' is reserved", 16)),
    ),
    ("declare let a: (await: number) => void;", Some((AWAIT, 16))),
    (
        "declare let a: { [static: string]: number };",
        Some(("The keyword 'static' is reserved", 18)),
    ),
    (
        "declare let a: { [await: string]: number };",
        Some((AWAIT, 18)),
    ),
    ("declare class C { x = 1; }", Some((AMBIENT, 20))),
    ("declare class C { static x = f(); }", Some((AMBIENT, 27))),
    ("class C { declare x = 1; }", Some((AMBIENT, 20))),
    ("declare class C { readonly x = 1; }", None),
    (
        "declare class C { readonly x: number = 1; }",
        Some((AMBIENT, 37)),
    ),
    ("declare class C { x? = 1; }", Some((AMBIENT, 21))),
    (
        "declare namespace N { class C { x = 1; } }",
        Some((AMBIENT, 34)),
    ),
    (
        "abstract class C { abstract x = 1; }",
        Some((
            "Property 'x' cannot have an initializer because it is marked abstract.",
            30,
        )),
    ),
    ("class C { declare x: number = 1; }", Some((AMBIENT, 28))),
    ("declare class C { [k] = 1; }", Some((AMBIENT, 22))),
    ("declare class C { static readonly x = 1; }", None),
    ("declare class C { #x = 1; }", None),
    (
        "declare namespace N { function f(await: number): void; }",
        Some((AWAIT, 33)),
    ),
    (
        "declare global { function f(await: number): void; }",
        Some((AWAIT, 28)),
    ),
    (
        "declare namespace N { function f<await>(): void; }",
        Some((AWAIT, 33)),
    ),
    (
        "declare namespace N { class C { m(await: number): void } }",
        Some((AWAIT, 34)),
    ),
    (
        "declare namespace N { namespace A { function f(await: number): void; } }",
        Some((AWAIT, 47)),
    ),
    (
        "declare namespace N { function f(...await: any[]): void; }",
        Some((AWAIT, 36)),
    ),
    (
        "declare namespace N { function f(arguments: number): void; }",
        None,
    ),
    (
        "declare global { function f(arguments: number): void; }",
        None,
    ),
    (
        "declare namespace N { function f<arguments>(): void; }",
        None,
    ),
    (
        "declare namespace N { namespace A { function f(arguments: number): void; } }",
        None,
    ),
    (
        "declare namespace N { function f(...arguments: any[]): void; }",
        None,
    ),
    (
        "declare module \"x\" { function f(await: number): void; }",
        Some((AWAIT, 32)),
    ),
    ("type await = 1;", Some((AWAIT, 5))),
    ("interface I { m(await: number): void }", Some((AWAIT, 16))),
    (
        "declare module \"x\" { let static: number; }",
        Some(("The keyword 'static' is reserved", 25)),
    ),
    (
        "declare module \"x\" { function f(static: number): void; }",
        Some(("The keyword 'static' is reserved", 32)),
    ),
    (
        "namespace N { type static = 1; }",
        Some(("The keyword 'static' is reserved", 19)),
    ),
    (
        "namespace N { interface static {} }",
        Some(("The keyword 'static' is reserved", 24)),
    ),
    (
        "type static = 1;",
        Some(("The keyword 'static' is reserved", 5)),
    ),
    (
        "interface I { m(static: number): void }",
        Some(("The keyword 'static' is reserved", 16)),
    ),
    (
        "declare namespace N { namespace M { let static: number; } }",
        Some(("The keyword 'static' is reserved", 40)),
    ),
    (
        "declare namespace N { function f(): void; let static: number; }",
        Some(("The keyword 'static' is reserved", 46)),
    ),
    (
        "declare namespace N { class C { m<static>(): void } }",
        Some(("The keyword 'static' is reserved", 34)),
    ),
    (
        "const k = \"x\"; abstract class C { abstract x = 1; }",
        Some((
            "Property 'x' cannot have an initializer because it is marked abstract.",
            45,
        )),
    ),
    (
        "const k = \"x\"; abstract class C { abstract 'x' = 1; }",
        Some((
            "Property '['x']' cannot have an initializer because it is marked abstract.",
            47,
        )),
    ),
    (
        "const k = \"x\"; abstract class C { abstract [k] = 1; }",
        Some((
            "Property '[k]' cannot have an initializer because it is marked abstract.",
            47,
        )),
    ),
    (
        "const k = \"x\"; abstract class C { abstract ['x'] = 1; }",
        Some((
            "Property '['x']' cannot have an initializer because it is marked abstract.",
            49,
        )),
    ),
    (
        "const k = \"x\"; abstract class C { abstract 1 = 2; }",
        Some((
            "Property '[1]' cannot have an initializer because it is marked abstract.",
            45,
        )),
    ),
    (
        "const k = \"x\"; abstract class C { abstract x: number = 1; }",
        Some((
            "Property 'x' cannot have an initializer because it is marked abstract.",
            53,
        )),
    ),
    (
        "const k = \"x\"; abstract class C { abstract x?: number = 1; }",
        Some((
            "Property 'x' cannot have an initializer because it is marked abstract.",
            54,
        )),
    ),
    (
        "const k = \"x\"; abstract class C { abstract readonly x = 1; }",
        Some((
            "Property 'x' cannot have an initializer because it is marked abstract.",
            54,
        )),
    ),
    (
        "const k = \"x\"; abstract class C { public abstract x = 1; }",
        Some((
            "Property 'x' cannot have an initializer because it is marked abstract.",
            52,
        )),
    ),
    (
        "const k = \"x\"; abstract class C { abstract x   =   1; }",
        Some((
            "Property 'x' cannot have an initializer because it is marked abstract.",
            47,
        )),
    ),
];

/// A class named by a word acorn-typescript reads as a TypeScript keyword's token, from svelte
/// 5.59.1 in runes mode.
const CLASS_NAMES: &[(&str, Option<(&str, u32)>)] = &[
    ("class type {}", Some(("Unexpected token", 6))),
    ("class interface {}", Some(("Unexpected token", 6))),
    ("const C = class type {};", Some(("Unexpected token", 16))),
    (
        "export default class type {}",
        Some(("Unexpected token", 21)),
    ),
    ("abstract class type {}", Some(("Unexpected token", 15))),
    ("declare class interface {}", Some(("Unexpected token", 14))),
    ("declare class declare {}", Some(("Unexpected token", 14))),
    (
        "declare abstract class interface {}",
        Some(("Unexpected token", 23)),
    ),
    (
        "export declare class interface {}",
        Some(("Unexpected token", 21)),
    ),
    ("class assert {}", Some(("Unexpected token", 6))),
    ("class of {}", None),
    ("class satisfies {}", None),
    (
        "class C<interface> {}",
        Some(("The keyword 'interface' is reserved", 8)),
    ),
];

#[test]
fn acorn_refuses_these_names_and_initializers_in_an_ambient_context() {
    assert_script_outcomes(CASES);
}

#[test]
fn acorn_typescript_stops_at_a_class_named_by_a_typescript_keyword() {
    assert_script_outcomes(CLASS_NAMES);
}

/// Asserts each case's outcome in a component's TypeScript script.
fn assert_script_outcomes(cases: &[(&str, Option<(&str, u32)>)]) {
    let open = "<script lang=\"ts\">";
    let sources: Vec<String> = cases
        .iter()
        .map(|(script, _)| format!("{open}{script}</script>"))
        .collect();
    let cases: Vec<_> = (sources.iter().zip(cases))
        .map(|(source, (_, expected))| {
            let expected =
                expected.map(|(message, at)| ("js_parse_error", message, at + open.len() as u32));
            (source.as_str(), expected)
        })
        .collect();
    assert_component_outcomes(&cases);
}
