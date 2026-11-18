use oxc_span::SourceType;
use rsvelte_kernel::source::positions::Span;

use super::Reader;
use crate::Tree;

/// What `reader` does with `text`, a TypeScript program oxc recovers from.
fn throws(reader: Reader, text: &str) -> Option<bool> {
    let (tree, (program, errors, tokens)) = Tree::build(text, |builder| {
        let range = Span::new(0, text.len() as u32);
        let rejected =
            (builder.program_or_errors(range, SourceType::ts().with_module(true))).expect_err(text);
        let tokens: Vec<_> = builder.recorded().iter().collect();
        Ok((rejected.recovered.expect(text), rejected.errors, tokens))
    })
    .expect(text);
    let errors: Vec<_> = errors.iter().collect();
    reader.throws(&tree, program, &errors, &tokens)
}

// What Prettier 3.9.10 does with each sample, with its `typescript` and `babel-ts` parsers.
const SAMPLES: [(&str, bool, Option<bool>); 35] = [
    ("let x = 1;\nreturn x;", false, Some(false)),
    ("class A { x = await f(); }", false, Some(true)),
    ("class A { x = await (f()); }", false, Some(false)),
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
    ("class C { declare accessor a; }", false, Some(false)),
    ("class C { static abstract m(); }", false, Some(true)),
];

// What Prettier 3.9.10's `babel-ts` does with each pair of modifiers that tsc reports as 1243 (or
// 1040), in either order.
const MODIFIER_PAIRS: [(&str, bool); 12] = [
    ("class C { accessor declare a; }", true),
    ("class C { readonly accessor a = 1; }", false),
    ("class C { accessor readonly a = 1; }", true),
    ("abstract class C { static abstract m(); }", true),
    ("abstract class C { abstract static m(); }", true),
    ("abstract class C { private abstract m(); }", false),
    ("abstract class C { abstract private m(); }", false),
    ("abstract class C { async abstract m(); }", true),
    ("abstract class C { abstract async m(); }", false),
    (
        "class B {} class C extends B { declare override a: number; }",
        true,
    ),
    (
        "class B {} class C extends B { override declare a: number; }",
        true,
    ),
    ("abstract class C { private abstract a: number; }", false),
];

#[test]
fn babel_typescript_throws_on_a_pair_of_modifiers_as_their_order_says() {
    for (text, babel) in MODIFIER_PAIRS {
        assert_eq!(
            throws(Reader::BabelTypescript, text),
            Some(babel),
            "{text:?}"
        );
    }
}

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
