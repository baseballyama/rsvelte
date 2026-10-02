use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript::parser::parse_program;
use rsvelte_typescript::syntax_tree::SyntaxTree;
use rsvelte_typescript_compile::codegen::print_program;

fn print(source_text: &str, typescript: bool) -> String {
    let mut syntax_tree = SyntaxTree::new();
    let p = parse_program(
        &mut syntax_tree,
        source_text,
        Span::new(0, source_text.len() as u32),
        typescript,
    )
    .unwrap_or_else(|e| panic!("{}: {:?}", e.message, e.span));
    print_program(&syntax_tree, source_text, p).out
}

/// Printing is a fixed point after one round: parse(print(x)) prints the same text.
fn stable(source_text: &str, typescript: bool) -> String {
    let once = print(source_text, typescript);
    let twice = print(&once, false);
    assert_eq!(once, twice, "not stable for {source_text:?}");
    once
}

#[test]
fn precedence_and_parentheses() {
    assert_eq!(
        stable(
            "a = (b, c); x = (1 + 2) * 3; y = 2 ** 3 ** 2; z = (2 ** 3) ** 2;",
            false
        ),
        "a = (b, c);\n\nx = (1 + 2) * 3;\n\ny = 2 ** 3 ** 2;\n\nz = (2 ** 3) ** 2;\n"
    );
    assert_eq!(
        stable("f(() => ({ a: 1 })); (function () {}());", false),
        "f(() => ({ a: 1 }));\n\n(function () {}());\n"
    );
    assert_eq!(
        stable("a ?? (b || c); (a && b) ?? c; - -x; typeof x;", false),
        "a ?? (b || c);\n\n(a && b) ?? c;\n\n- -x;\n\ntypeof x;\n"
    );
}

#[test]
fn declarations_patterns_and_asi() {
    let out = stable(
        "let { a, b: [c, , d = 1], ...rest } = obj\
         \nconst f = async (x, { y } = {}) => { return x + y }\
         \nfunction g(a, ...b) { if (a) return; else { b } }",
        false,
    );
    assert!(
        out.contains("let { a, b: [c, , d = 1], ...rest } = obj;"),
        "{out}"
    );
    assert!(
        out.contains("const f = async (x, { y } = {}) => {"),
        "{out}"
    );
}

#[test]
fn typescript_is_erased() {
    let out = stable(
        "import type { A } from './a';\
         \nimport { type B, c } from './b';\
         \ntype P = { a: string };\
         \ninterface Q { b: number }\
         \nlet { name }: P = $props();\
         \nconst n = (x as number)!;\
         \nfunction h(a: string, b?: number): void {}\
         \nconst k = (v: string): string => v;",
        true,
    );
    assert_eq!(
        out,
        "import { c } from './b';\n\
         \nlet { name } = $props();\n\
         \nconst n = x;\n\
         \nfunction h(a, b) {}\n\
         \nconst k = (v) => v;\n"
    );
}

#[test]
fn templates_strings_and_members() {
    let out = stable(
        "const s = `a${b}c${`d${e}`}`; o?.p?.[q]?.(r); new Foo(1).bar; 'it\\'s';",
        false,
    );
    assert!(out.contains("const s = `a${b}c${`d${e}`}`;"), "{out}");
    assert!(out.contains("o?.p?.[q]?.(r);"), "{out}");
    assert!(out.contains("new Foo(1).bar;"), "{out}");
}

#[test]
fn unsupported_syntax_is_an_error_not_a_panic() {
    for source_text in ["for (;;) {}", "class A {}", "x = /re/g", "a`t`"] {
        let mut syntax_tree = SyntaxTree::new();
        assert!(
            parse_program(
                &mut syntax_tree,
                source_text,
                Span::new(0, source_text.len() as u32),
                false
            )
            .is_err(),
            "{source_text}"
        );
    }
}
