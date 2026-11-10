use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_syntax::parser::parse_program;
use rsvelte_typescript_syntax::syntax_tree::SyntaxTree;

fn parses(source_text: &str, typescript: bool) -> bool {
    let mut syntax_tree = SyntaxTree::new();
    parse_program(
        &mut syntax_tree,
        source_text,
        Span::new(0, source_text.len() as u32),
        typescript,
    )
    .is_ok()
}

#[test]
fn await_is_an_expression_only_at_the_top_level_and_in_an_async_function() {
    for source_text in [
        "function f() { await 1; }",
        "const f = () => { await 1; };",
        "const f = () => await 1;",
        "function f() { for await (const a of []) {} }",
        "class K { x = await 1; }",
        "class K { static { await 1; } }",
        "class K { m() { await 1; } }",
        "const o = { m() { await 1; } };",
        "async function f() { function g() { await 1; } }",
        "function f(a = await 1) {}",
        "async function f(a = await 1) {}",
        "const f = (a = await 1) => a;",
        "const f = async (a = await 1) => a;",
        "async function f() { class K { m(a = await 1) {} } }",
        "const o = { async m([a] = await b) {} };",
        "await;",
        "f(await);",
    ] {
        assert!(!parses(source_text, false), "{source_text}");
    }
    for source_text in [
        "await 1;",
        "for await (const a of []) {}",
        "async function f() { await 1; for await (const a of []) {} }",
        "const f = async () => await 1;",
        "class K { async m() { await 1; } }",
        "const o = { async m() { await 1; } };",
        "function f() { const g = async () => await 1; }",
        "await -1;",
        "class K { [await 1] = 2; }",
        "async function f(a = 1) { await a; }",
    ] {
        assert!(parses(source_text, false), "{source_text}");
    }
}

#[test]
fn a_module_binds_no_reserved_word() {
    let names = [
        "this",
        "true",
        "null",
        "new",
        "let",
        "static",
        "implements",
        "package",
        "eval",
    ];
    let names = names
        .into_iter()
        .chain(["arguments", "await", "yield", "interface", "private"]);
    for name in names {
        for template in [
            "let N = 1;",
            "let [N] = [1];",
            "let { a: N } = {};",
            "let { N } = {};",
            "function f(N) {}",
            "function f(...N) {}",
            "function N() {}",
            "class N {}",
            "const f = N => 1;",
            "const f = (N) => 1;",
            "try {} catch (N) {}",
            "import N from 'x';",
            "import * as N from 'x';",
            "import { a as N } from 'x';",
        ] {
            let source_text = template.replace('N', name);
            assert!(!parses(&source_text, false), "{source_text}");
        }
    }
    for (source_text, typescript) in [
        ("function f(...this: any[]) {}", true),
        ("function f(this: Window = window) {}", true),
        ("import { static } from 'x';", false),
    ] {
        assert!(!parses(source_text, typescript), "{source_text}");
    }
    assert!(parses("function f(this: Window, e: Event) {}", true));
}

/// Acorn's wording, which says why the name is refused.
#[test]
fn a_refused_name_says_why() {
    for (source_text, message) in [
        ("let true = 1;", "Unexpected keyword 'true'"),
        ("let static = 1;", "The keyword 'static' is reserved"),
        ("let eval = 1;", "Binding eval in strict mode"),
        (
            "function f() { let await = 1; }",
            "Cannot use keyword 'await' outside an async function",
        ),
    ] {
        let mut syntax_tree = SyntaxTree::new();
        let Err(error) = parse_program(
            &mut syntax_tree,
            source_text,
            Span::new(0, source_text.len() as u32),
            false,
        ) else {
            panic!("{source_text} parses");
        };
        assert_eq!(error.message, message, "{source_text}");
    }
}

#[test]
fn a_module_references_no_strict_reserved_word_and_assigns_no_eval() {
    for source_text in [
        "static;",
        "let x = implements;",
        "({ let });",
        "eval = 1;",
        "arguments++;",
        "--eval;",
        "[eval] = a;",
        "({ arguments } = a);",
        "static: for (;;) break static;",
        "yield: 1;",
        "let: 1;",
    ] {
        assert!(!parses(source_text, false), "{source_text}");
    }
    for source_text in [
        "a.static;",
        "({ static: 1, let: 2 });",
        "let { static: s } = o;",
        "import { static as s, default as d } from 'x';",
        "eval(a); arguments;",
        "class K { static x = 1; }",
        "eval: 1;",
    ] {
        assert!(parses(source_text, false), "{source_text}");
    }
}

#[test]
fn nullish_coalescing_does_not_mix_with_logical_operators_without_parentheses() {
    for source_text in [
        "a ?? b || c;",
        "a || b ?? c;",
        "a && b ?? c;",
        "a ?? b && c;",
        "a ?? b + c || d;",
    ] {
        assert!(!parses(source_text, false), "{source_text}");
    }
    for source_text in [
        "(a ?? b) || c;",
        "a ?? (b && c);",
        "a ?? b ?? c;",
        "a || b && c;",
        "a ?? b | c;",
    ] {
        assert!(parses(source_text, false), "{source_text}");
    }
}

#[test]
fn only_a_function_takes_a_typescript_this_parameter() {
    for source_text in [
        "const f = (this: Window, a: number) => a;",
        "const f = async (this) => 1;",
    ] {
        assert!(!parses(source_text, true), "{source_text}");
    }
    for source_text in [
        "function f(this: Window, a: number) {}",
        "const o = { m(this: Window) {} };",
        "class K { m(this: K) {} }",
        "type F = (this: Window) => void;",
    ] {
        assert!(parses(source_text, true), "{source_text}");
    }
}
