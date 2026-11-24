//! An ambient context: acorn-typescript reads any statement in an ambient namespace, which
//! upstream's `remove_typescript_nodes` then refuses as a value, and reports an implementation
//! only for a function declaration, at its start, which follows an export's `declare`.

use rsvelte_svelte_compile::{CompileOptions, compile};

/// A TypeScript script, and the code and offset in it of what svelte 5.57.3 and 5.59.1 raise in
/// runes mode, or `None` where they compile.
const CASES: &[(&str, Option<(&str, u32)>)] = &[
    (
        "declare namespace N { a; }",
        Some(("typescript_invalid_feature", 0)),
    ),
    (
        "declare namespace N { if (x) {} }",
        Some(("typescript_invalid_feature", 0)),
    ),
    (
        "declare namespace N { return; }",
        Some(("js_parse_error", 22)),
    ),
    (
        "declare namespace N { ; }",
        Some(("typescript_invalid_feature", 0)),
    ),
    (
        "declare namespace N { {} }",
        Some(("typescript_invalid_feature", 0)),
    ),
    (
        "declare namespace N { for (;;) {} }",
        Some(("typescript_invalid_feature", 0)),
    ),
    (
        "declare namespace N { a = 1; }",
        Some(("typescript_invalid_feature", 0)),
    ),
    (
        "declare module 'x' { a; }",
        Some(("typescript_invalid_feature", 0)),
    ),
    (
        "declare global { a; }",
        Some(("typescript_invalid_feature", 0)),
    ),
    (
        "declare namespace N { namespace M { a; } }",
        Some(("typescript_invalid_feature", 22)),
    ),
    (
        "namespace N { declare namespace M { a; } }",
        Some(("typescript_invalid_feature", 14)),
    ),
    (
        "declare namespace N { function f() {} }",
        Some(("js_parse_error", 22)),
    ),
    (
        "declare namespace N { export function f() {} }",
        Some(("js_parse_error", 29)),
    ),
    (
        "declare module 'x' { function f() {} }",
        Some(("js_parse_error", 21)),
    ),
    (
        "declare global { function f() {} }",
        Some(("js_parse_error", 17)),
    ),
    ("declare function f() {}", Some(("js_parse_error", 0))),
    (
        "export declare function f() {}",
        Some(("js_parse_error", 15)),
    ),
    (
        "export declare async function f() {}",
        Some(("js_parse_error", 15)),
    ),
    (
        "declare namespace N { export declare function f() {} }",
        Some(("js_parse_error", 37)),
    ),
    ("declare class C { m() {} }", None),
    ("declare class C { constructor() {} }", None),
    ("declare class C { get a() { return 1; } }", None),
    ("declare class C { static {} }", None),
    (
        "declare namespace N { class C { m() {} } }",
        Some(("typescript_invalid_feature", 0)),
    ),
    (
        "declare namespace N { let a = 1; }",
        Some(("js_parse_error", 30)),
    ),
    (
        "declare namespace N { const a = 1; }",
        Some(("typescript_invalid_feature", 0)),
    ),
    ("declare const a = 1;", None),
    ("declare let a = 1;", Some(("js_parse_error", 16))),
    (
        "declare namespace N { function f(): void; function f() {} }",
        Some(("js_parse_error", 42)),
    ),
    (
        "declare namespace N { a; function f() {} }",
        Some(("js_parse_error", 25)),
    ),
    (
        "declare namespace N { function f() {} a; }",
        Some(("js_parse_error", 22)),
    ),
];

#[test]
fn acorn_typescript_reads_statements_and_methods_in_an_ambient_context() {
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
