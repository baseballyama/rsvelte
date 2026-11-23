//! A class's name: acorn checks it only where the class is a declaration, and upstream's
//! `Identifier` visitor reports `arguments` outside a function wherever it stands, once
//! `remove_typescript_nodes` has erased the types.

use super::outcomes::{Outcome, assert_component_outcomes};

const ARGUMENTS: &str =
    "The arguments keyword cannot be used within the template or at the top level of a component";
const EVAL: &str = "Binding eval in strict mode";

/// Each component and what svelte 5.57.3 gives for it in runes mode.
const CASES: &[(&str, Outcome<'_>)] = &[
    ("<script>const C = class eval {};</script>", None),
    ("<script>const f = (a = class eval {}) => 0;</script>", None),
    ("<script>(class eval extends Object {});</script>", None),
    (
        "<script lang=\"ts\">const C = class eval<T> {};</script>",
        None,
    ),
    ("{class eval {}}", None),
    (
        "<script>const C = class eval {}; delete x;</script>",
        Some((
            "js_parse_error",
            "Deleting local variable in strict mode",
            33,
        )),
    ),
    (
        "<script>class eval {}</script>",
        Some(("js_parse_error", EVAL, 14)),
    ),
    (
        "<script module>export default class eval {}</script>",
        Some(("js_parse_error", EVAL, 36)),
    ),
    (
        "<script>function f() { class eval {} }</script>",
        Some(("js_parse_error", EVAL, 29)),
    ),
    (
        "<script>const C = class arguments {};</script>",
        Some(("invalid_arguments_usage", ARGUMENTS, 24)),
    ),
    (
        "<script>const f = () => class arguments {};</script>",
        Some(("invalid_arguments_usage", ARGUMENTS, 30)),
    ),
    (
        "{class arguments {}}",
        Some(("invalid_arguments_usage", ARGUMENTS, 7)),
    ),
    (
        "<script>function f() { return class arguments {}; }</script>",
        None,
    ),
    (
        "<script>const o = { m() { return class arguments {}; } };</script>",
        None,
    ),
];

#[test]
fn acorn_checks_the_name_of_a_class_declaration_only() {
    assert_component_outcomes(CASES);
}

/// `arguments` in a TypeScript script, and the offset in the script where svelte 5.57.3 and 5.59.1
/// report it in runes mode, or `None` where they compile: acorn-typescript does not check a name
/// only a type gives, and upstream analyzes what `remove_typescript_nodes` leaves.
const TYPES: &[(&str, Option<u32>)] = &[
    ("function f<arguments>(x: arguments) { return x; }", None),
    ("const f = <arguments,>(x: arguments) => x;", None),
    ("class C<arguments> {}", None),
    ("const C = class<arguments> {};", None),
    ("type F = (arguments: number) => void;", None),
    ("declare function g(arguments: number): void;", None),
    ("type M = { [arguments in \"a\"]: 1 };", None),
    (
        "type U<T> = T extends Array<infer arguments> ? arguments : never;",
        None,
    ),
    (
        "abstract class A { abstract m(arguments: number): void }",
        None,
    ),
    ("interface I { (arguments: number): void }", None),
    ("let x: arguments | undefined;", None),
    ("let y = 1; let x: typeof arguments;", None),
    ("class C implements arguments {}", None),
    ("const K = class implements arguments {};", None),
    ("class C implements arguments.X {}", None),
    ("class C implements I<arguments> {}", None),
    ("abstract class C { abstract [arguments](): void; }", None),
    (
        "abstract class C { abstract get [arguments](): number; }",
        None,
    ),
    (
        "abstract class C { abstract m(x = arguments): void; }",
        None,
    ),
    ("function f(x = arguments): void; function f() {}", None),
    ("class C extends Base<arguments> {}", None),
    ("interface I extends arguments {}", None),
    ("const g = f<typeof arguments>;", None),
    ("class C { declare [arguments]: number; }", None),
    ("declare class C { [arguments]: number; }", None),
    (
        "let f = function (this: Window) { return arguments; };",
        None,
    ),
    ("export declare enum E { A = arguments }", None),
    ("export declare const enum E { A = arguments }", None),
    ("export declare class C { m(x = arguments): void; }", None),
    ("class C { m(arguments: number): void; }", Some(12)),
    ("class C { m(x = arguments): void; }", Some(16)),
    (
        "class C { constructor(arguments: number); constructor() {} }",
        Some(22),
    ),
    (
        "abstract class C { abstract [arguments]: number; }",
        Some(29),
    ),
    ("class C { [arguments]() {} }", Some(11)),
    ("const x = arguments as any;", Some(10)),
];

#[test]
fn arguments_is_checked_in_what_erasing_the_types_leaves() {
    let open = "<script lang=\"ts\">";
    let cases: Vec<(String, Outcome<'_>)> = (TYPES.iter())
        .map(|&(script, at)| {
            let outcome =
                at.map(|at| ("invalid_arguments_usage", ARGUMENTS, at + open.len() as u32));
            (format!("{open}{script}</script>"), outcome)
        })
        .collect();
    let cases: Vec<(&str, Outcome<'_>)> = cases.iter().map(|(s, o)| (s.as_str(), *o)).collect();
    assert_component_outcomes(&cases);
}
