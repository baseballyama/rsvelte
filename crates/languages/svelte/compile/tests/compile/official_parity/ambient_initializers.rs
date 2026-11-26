//! A variable's initializer in an ambient context, which acorn-typescript checks once it has read
//! the declaration.

use rsvelte_svelte_compile::{CompileOptions, compile};

const CONST: &str = concat!(
    "A 'const' initializer in an ambient context must be a string or numeric literal or literal ",
    "enum reference."
);

/// A TypeScript script, and acorn's message and its offset in the script, from svelte 5.57.3 and
/// 5.59.1 in runes mode, or `None` where it compiles.
const CASES: &[(&str, Option<(&str, u32)>)] = &[
    ("declare const a = 1;", None),
    ("declare const a: number; const b = f();", None),
    ("declare class C {} const d = f();", None),
    (
        "class C { declare x: number; m() { const y = f(); } }",
        None,
    ),
    ("declare const a = \"s\";", None),
    ("declare const a = `t`;", None),
    ("declare const a = `t${1}`;", Some((CONST, 18))),
    ("declare const a = -1;", None),
    ("declare const a = +1;", None),
    ("declare const a = -\"1\";", Some((CONST, 18))),
    ("declare const a = E.A;", None),
    ("declare const a = E[\"A\"];", Some((CONST, 18))),
    ("declare const a = () => {};", Some((CONST, 18))),
    ("declare const a = {};", Some((CONST, 18))),
    ("declare const a = true;", None),
    ("declare const a = null;", None),
    ("declare const a = /r/;", None),
    ("declare const a = 1n;", None),
    ("declare const a = x;", Some((CONST, 18))),
    ("declare const a = void 0;", Some((CONST, 18))),
    ("declare const a = -1n;", None),
    ("declare const a = (1);", None),
    ("declare const a = E.A.B;", None),
    ("declare const a = -x;", Some((CONST, 18))),
    ("declare const a = !1;", Some((CONST, 18))),
    ("declare const a = ~1;", Some((CONST, 18))),
    ("declare const a = f();", Some((CONST, 18))),
    ("declare const a = [];", Some((CONST, 18))),
    ("declare const a = typeof x;", Some((CONST, 18))),
    (
        "declare const a: number = 1;",
        Some(("Initializers are not allowed in ambient contexts.", 26)),
    ),
    (
        "declare let a = 1;",
        Some(("Initializers are not allowed in ambient contexts.", 16)),
    ),
    (
        "declare var a = 1;",
        Some(("Initializers are not allowed in ambient contexts.", 16)),
    ),
    (
        "declare namespace N { const a = () => {}; }",
        Some((CONST, 32)),
    ),
    (
        "declare namespace N { let a = 1; }",
        Some(("Initializers are not allowed in ambient contexts.", 30)),
    ),
    ("declare const a = 1, b = f();", Some((CONST, 25))),
    ("declare module \"m\" { const a = f(); }", Some((CONST, 31))),
    ("export declare const a = f();", Some((CONST, 25))),
    (
        "declare namespace N { export const a = f(); }",
        Some((CONST, 39)),
    ),
    ("declare global { const a = f(); }", Some((CONST, 27))),
    (
        "declare namespace N { let a = f(); }",
        Some(("Initializers are not allowed in ambient contexts.", 30)),
    ),
    ("const a = f();", None),
    (
        "declare const a: number = f();",
        Some(("Initializers are not allowed in ambient contexts.", 26)),
    ),
    ("declare const a = 1 as const;", Some((CONST, 18))),
    (
        "declare const a = (x, x) => 1;",
        Some(("Argument name clash", 22)),
    ),
    ("declare const a = -(1);", None),
    ("declare const a = E?.A;", Some((CONST, 18))),
    ("declare const a = E.A[\"b\"];", Some((CONST, 18))),
    ("declare const a = E[`c`];", None),
    ("declare const a = E[`c${1}`];", Some((CONST, 18))),
    ("declare const a = E[0];", Some((CONST, 18))),
    ("declare const a = \"a\" + \"b\";", Some((CONST, 18))),
    ("declare const a = -true;", Some((CONST, 18))),
    ("declare const a = E[\"a\"].b;", Some((CONST, 18))),
    ("declare const a = (E).A;", None),
    ("declare const a = 1!;", Some((CONST, 18))),
    ("declare const a = 1 satisfies number;", Some((CONST, 18))),
    (
        "declare namespace N { namespace M { const a = f(); } }",
        Some((CONST, 46)),
    ),
    (
        "declare class C { static { const a = f(); } }",
        Some((CONST, 37)),
    ),
    (
        "declare const a = f(), b = (y, y) => 1;",
        Some(("Argument name clash", 31)),
    ),
    ("declare const a = f(); let 1x;", Some((CONST, 18))),
    (
        "declare const a = function (x, x) {};",
        Some(("Argument name clash", 31)),
    ),
    ("declare const a = this.A;", Some((CONST, 18))),
    ("declare const a = E.A.B.C;", None),
    ("declare const a = -(1n);", None),
    (
        "declare namespace N { function f(): void; } declare const a = f();",
        Some((CONST, 62)),
    ),
    (
        "declare let a = 1, b = (y, y) => 1;",
        Some(("Argument name clash", 27)),
    ),
    (
        "declare let a = 1; let 1x;",
        Some(("Initializers are not allowed in ambient contexts.", 16)),
    ),
    ("declare function f(a = 1): void;", None),
    (
        "declare let a = 1, eval: number;",
        Some(("Binding eval in strict mode", 19)),
    ),
    (
        "declare const a = f(), eval: number;",
        Some(("Binding eval in strict mode", 23)),
    ),
];

#[test]
fn an_ambient_initializer_is_checked_after_its_declaration() {
    let open = "<script lang=\"ts\">";
    for &(script, expected) in CASES {
        let source = format!("{open}{script}</script>");
        let raised = compile(&source, &CompileOptions::default())
            .err()
            .map(|error| super::outcomes::raised(&error));
        let expected = expected.map(|(message, at)| {
            super::outcomes::official("js_parse_error", message, at + open.len() as u32)
        });
        assert_eq!(raised, expected, "{source}");
    }
}
