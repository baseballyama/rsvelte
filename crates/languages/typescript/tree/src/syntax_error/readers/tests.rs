use oxc_span::SourceType;
use rsvelte_kernel::source::positions::Span;

use super::Reader;
use crate::Tree;

/// What `reader` does with `text`, a TypeScript program oxc recovers from.
fn throws(reader: Reader, text: &str) -> Option<bool> {
    let (tree, (program, errors)) = Tree::build(text, |builder| {
        let range = Span::new(0, text.len() as u32);
        let rejected =
            (builder.program_or_errors(range, SourceType::ts().with_module(true))).expect_err(text);
        Ok((rejected.recovered.expect(text), rejected.errors))
    })
    .expect(text);
    reader.throws(&tree, program, &errors)
}

// What Prettier 3.9.10 does with each sample, with its `typescript` and `babel-ts` parsers.
const SAMPLES: [(&str, bool, Option<bool>); 32] = [
    ("function f(a?: number = 1) {}", false, Some(false)),
    ("function f(a?: number, b: number) {}", false, Some(false)),
    ("class K { readonly m() {} }", true, Some(true)),
    ("class C { readonly static a = 1; }", false, Some(true)),
    ("class C { accessor static a = 1; }", false, Some(true)),
    ("class C { static private a = 1; }", false, Some(true)),
    ("class A { declare constructor() {} }", true, Some(true)),
    (
        "declare namespace N { declare const a: number; }",
        false,
        Some(false),
    ),
    ("class K { declare a = 1; }", false, Some(true)),
    ("declare let a = 1;", true, Some(true)),
    ("function f(...p?: string[]) {}", false, Some(false)),
    (
        "class C { set x(a: number, b: number) {} }",
        false,
        Some(true),
    ),
    ("class C { set x(a?: number) {} }", false, Some(false)),
    ("class C { constructor(): void {} }", false, Some(false)),
    ("class C { get x<T>() { return 1; } }", false, Some(false)),
    ("class C { set x(a: number): void {} }", false, Some(false)),
    (
        "interface I { [a: string, b: string]: number }",
        false,
        Some(true),
    ),
    ("function f<>() {}", true, Some(true)),
    (
        "namespace N { import a = require(\"a\"); }",
        false,
        Some(true),
    ),
    ("namespace N { export * from \"a\"; }", false, Some(true)),
    ("type T = [a?: string, b: string];", false, Some(true)),
    ("class K { abstract a = 1; }", true, Some(true)),
    ("class C { accessor m() {} }", true, Some(true)),
    (
        "function f() { for await (const a of b) {} }",
        false,
        Some(true),
    ),
    ("type T<number> = number;", false, Some(false)),
    ("class C { constructor(this: C) {} }", false, Some(false)),
    ("class C { private #a = 1; }", false, Some(true)),
    ("let a!: number = 1;", true, Some(false)),
    ("let a!;", true, Some(false)),
    ("declare function* f(): any;", true, Some(false)),
    // Babel throws on some of 1243's modifier pairs only.
    ("class C { declare accessor a; }", false, None),
    ("class C { static abstract m(); }", false, None),
];

#[test]
fn each_reader_throws_where_prettier_s_parser_does() {
    for (text, typescript, babel) in SAMPLES {
        assert_eq!(
            throws(Reader::TypescriptEstree, text),
            Some(typescript),
            "{text:?}"
        );
        assert_eq!(throws(Reader::BabelTypescript, text), babel, "{text:?}");
    }
}
