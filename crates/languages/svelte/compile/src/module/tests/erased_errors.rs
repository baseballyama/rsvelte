//! The errors in a `.svelte.ts` module that upstream never reads, since TypeScript's emit removes
//! the code they are in, and the errors in what the emit keeps, which acorn raises.

use super::*;

/// The first error of the module on both targets, as its code and the first line of its message.
fn first_error(source: &str) -> Option<(String, String)> {
    let [client, server] = [Target::Client, Target::Server].map(|target| {
        let output = output("a.svelte.ts", source, target);
        (output.diagnostics.first()).map(|d| {
            let message = d.message.lines().next().unwrap_or_default();
            (d.code.to_string(), message.to_owned())
        })
    });
    assert_eq!(client, server, "{source:?}");
    client
}

#[test]
fn a_typescript_module_reports_no_error_in_what_its_emit_removes() {
    // TypeScript 6.0.3's emit, then svelte 5.59.1's `compileModule`, compiles each.
    for source in [
        "declare class C { x = 1 }",
        "declare abstract class C { abstract x = 1 }",
        "abstract class C { abstract x = 1 }",
        "abstract class C { abstract 'x' = 1 }",
        "abstract class C { static abstract x = 1 }",
        "abstract class C { abstract #x = 1 }",
        "declare class undefined {}",
        "type undefined = 1;",
        "interface undefined {}",
        "export declare let await: number;",
        "export declare function await(): void;",
        "declare namespace N { class C { x = await f(); } }",
        "declare enum arguments { A }",
    ] {
        assert_eq!(first_error(source), None, "{source:?}");
    }
}

#[test]
fn a_typescript_module_reports_an_error_in_what_its_emit_keeps() {
    // svelte 5.59.1's `compileModule` of TypeScript 6.0.3's emit raises each.
    for (source, message) in [
        ("let a; let a;", "Identifier 'a' has already been declared"),
        (
            "declare namespace N {} let a = 1; let a = 2;",
            "Identifier 'a' has already been declared",
        ),
        ("break;", "Unsyntactic break"),
        (
            "new.target;",
            "'new.target' can only be used in functions and class static block",
        ),
        ("const x;", "Unexpected token"),
        (
            "x?.y = 1;",
            "Optional chaining cannot appear in left-hand side",
        ),
        (
            "class C { constructor() {} constructor() {} }",
            "Duplicate constructor in the same class",
        ),
        (
            "abstract class C { abstract m(): void; m(a, a) {} }",
            "Argument name clash",
        ),
        (
            "class C { x = await f(); }",
            "Cannot use keyword 'await' outside an async function",
        ),
    ] {
        let expected = Some(("js_parse_error".to_owned(), message.to_owned()));
        assert_eq!(first_error(source), expected, "{source:?}");
    }
}

#[test]
fn a_typescript_module_that_oxc_cannot_read_fails_where_typescript_reads_on() {
    // TypeScript 6.0.3 reads on past these errors, and its emit drops `keyof` (svelte compiles it)
    // or leaves text that svelte 5.59.1 rejects as "Unexpected token". See `DIVERGENCES.md`.
    for (source, message) in [
        ("let v: keyof;", "Unexpected token"),
        (
            "declare let enum: number;",
            "The keyword 'enum' is reserved",
        ),
    ] {
        let expected = Some(("js_parse_error".to_owned(), message.to_owned()));
        assert_eq!(first_error(source), expected, "{source:?}");
    }
}

#[test]
fn a_typescript_module_writes_a_number_with_a_leading_zero_as_its_value() {
    // TypeScript 6.0.3's emit writes the value, which svelte 5.59.1's `compileModule` compiles.
    for (source, value) in [
        ("export const a = 08;\n", "export const a = 8;"),
        ("export const a = 010;\n", "export const a = 8;"),
        ("export const a = 08.5e1;\n", "export const a = 85;"),
        (
            "export const a = { 010: 1 };\n",
            "export const a = { 8: 1 };",
        ),
    ] {
        let javascript = compile("a.svelte.ts", source, Target::Client);
        assert!(javascript.contains(value), "{source:?}: {javascript}");
    }
}
