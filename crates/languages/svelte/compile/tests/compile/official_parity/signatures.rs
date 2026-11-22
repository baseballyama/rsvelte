//! Parameters of one name in a TypeScript script: acorn-typescript checks them only in a
//! function with a body, and reads a signature's or a bodiless function's as types.

use rsvelte_svelte_compile::{CompileOptions, compile};

/// Scripts svelte 5.57.3 compiles in runes mode.
const COMPILES: &[&str] = &[
    "type F = (a: number, a: number) => void;",
    "interface I { m(a: number, a: number): void }",
    "interface I { (a: number, a: number): void }",
    "interface I { new (a: number, a: number): I }",
    "type C = new (a: number, a: number) => object;",
    "declare function f(a: number, a: number): void;",
    "function f(a: number, a: number): void; function f() {}",
    "abstract class A { abstract m(a: number, a: number): void }",
    "let x: { m(a: number, a: number): void };",
    "type F = ({ a }: any, a: number) => void;",
    "type F = (a: number, ...a: number[]) => void;",
    "type F = (this: any, a: number, a: number) => void;",
];

/// Scripts svelte 5.57.3 rejects in runes mode, with the code, the first line of the message and
/// where the error is in the script.
const REJECTS: &[(&str, &str, &str, u32)] = &[
    (
        "class A { m(a: number, a: number): void; m() {} }",
        "duplicate_class_field",
        "`m` has already been declared",
        41,
    ),
    (
        "function f(a: number, a: number) {}",
        "js_parse_error",
        "Argument name clash",
        22,
    ),
    (
        "const f = (a: number, a: number) => 1;",
        "js_parse_error",
        "Argument name clash",
        22,
    ),
    (
        "class A { m(a: number, a: number) {} }",
        "js_parse_error",
        "Argument name clash",
        23,
    ),
];

#[test]
fn only_a_function_with_a_body_checks_its_parameter_names() {
    let open = "<script lang=\"ts\">";
    let compiled = |script: &str| {
        let source = format!("{open}{script}</script>");
        compile(&source, &CompileOptions::default())
            .map(|_| ())
            .map_err(|error| {
                (
                    error.code.to_string(),
                    error.message.lines().next().map(str::to_owned),
                    error.span.start_offset,
                )
            })
    };
    for script in COMPILES {
        assert_eq!(compiled(script), Ok(()), "{script}");
    }
    for &(script, code, message, at) in REJECTS {
        let expected = (
            code.to_owned(),
            Some(message.to_owned()),
            at + open.len() as u32,
        );
        assert_eq!(compiled(script), Err(expected), "{script}");
    }
}
