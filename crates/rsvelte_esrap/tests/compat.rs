//! Port of esrap's `test/compat.test.js`: plain JS, a TS type annotation, and a
//! TS `declare module` + mapped type all print as expected.

use oxc_allocator::Allocator;
use oxc_ast::ast::Statement;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_esrap::{PrintOptions, UNLOCATED_SPAN, print, print_with_map};

fn print_src(source: &str, ts: bool) -> String {
    let alloc = Allocator::default();
    let st = SourceType::default().with_module(true).with_typescript(ts);
    let ret = Parser::new(&alloc, source, st).parse();
    assert!(
        ret.diagnostics.is_empty(),
        "parse error: {:?}",
        ret.diagnostics
    );
    print(&ret.program, source)
}

#[test]
fn plain_js() {
    assert_eq!(print_src("const x = 1;", false), "const x = 1;");
}

#[test]
fn direct_matches_deferred_sequences_and_comments() {
    let cases = [
        "const x = { a: 1 };",
        "const x = { a: 1, b: 2, c: 3, d: 4 };",
        "const x = [a, b, c, d];",
        "const x = [a, , b];",
        "function f(a, b, c, d) { return a + b + c + d; }",
        "const { a, b, c, d } = value;",
        "const x = (a, b, c, d);",
        "const x = [{ alpha: very_long_identifier_name, beta: another_long_identifier_name }, { gamma: third_long_identifier_name }];",
        "call({ alpha: very_long_identifier_name, beta: another_long_identifier_name }, tail);",
        "call(head, { alpha: very_long_identifier_name, beta: another_long_identifier_name });",
        "call(head, { alpha: very_long_identifier_name, beta: another_long_identifier_name }, tail);",
        "() => $.clsx($.get(content)({ class: clsx($.get(theme)?.content, $$props.classes?.content) }));",
        "let first = very_long_identifier_name, second = another_long_identifier_name, third = final_long_identifier_name;",
        "const x = { only: { alpha: very_long_identifier_name, beta: another_long_identifier_name } };",
        "// lead\nconst x = 1; // tail",
        "const x = [a, /* between */ b, c];",
        "const value = [a, // first\n b, /* middle */ c];",
        "function f() {\n\t// before return\n\treturn (/* value */ x);\n}",
        "const {\n\ta,\n\t// before property\n\tb,\n\tc\n} = value;",
        "const x = 1;\n\n\n// detached\nconst y = 2;",
        "/**\n * alpha\n * beta\n */\nconst x = 1;",
    ];

    for source in cases {
        let alloc = Allocator::default();
        let ret = Parser::new(&alloc, source, SourceType::default().with_module(true)).parse();
        assert!(
            ret.diagnostics.is_empty(),
            "parse error for {source:?}: {:?}",
            ret.diagnostics
        );
        let options = PrintOptions::default();
        assert_eq!(
            print(&ret.program, source),
            print_with_map(&ret.program, source, &options).code,
            "direct/deferred mismatch for {source:?}"
        );
    }
}

#[test]
fn unlocated_fragment_body_exhausts_comments() {
    let source = "{\n\t// discarded\n\tconst x = 1;\n}";
    let alloc = Allocator::default();
    let mut ret = Parser::new(&alloc, source, SourceType::mjs()).parse();
    let Statement::BlockStatement(block) = &mut ret.program.body[0] else {
        panic!("expected block statement")
    };
    block.span = UNLOCATED_SPAN;

    assert_eq!(print(&ret.program, source), "{\n\tconst x = 1;\n}");
}

/// A NON-optional call whose callee is an optional chain must parenthesize the
/// callee (`(a?.b)(c)`), otherwise it would be mis-printed as the optional-chain
/// call `a?.b(c)`, which short-circuits differently. Mirrors esrap's explicit
/// `node.callee.type === 'ChainExpression'` wrap rule.
#[test]
fn non_optional_call_on_chain_callee_parenthesizes() {
    assert_eq!(
        print_src("(instruct?.dataComponent)($$renderer);", false),
        "(instruct?.dataComponent)($$renderer);"
    );
    // A genuinely optional call keeps `?.(` and is not over-parenthesized.
    assert_eq!(print_src("snippet?.(x);", false), "snippet?.(x);");
}

#[test]
fn ts_type_annotation() {
    assert_eq!(
        print_src("const x: number = 1;", true),
        "const x: number = 1;"
    );
}

/// A `// line` comment positioned before a destructured property must force the
/// object pattern multiline and sit on its own line — mirroring esrap's `_`
/// wildcard, which flushes leading comments before every node. Without this the
/// comment swallows the following token (`tabindex = // for safari 0,`), making
/// the output unparseable. Oracle (esrap 2.2.11) verified byte-for-byte.
#[test]
fn object_pattern_leading_line_comment_forces_multiline() {
    let input =
        "let {\n\tchildren,\n\tid = 1,\n\t// for safari\n\ttabindex = 0,\n\t...rest\n} = $$props;";
    assert_eq!(print_src(input, false), input);
}

#[test]
fn ts_module_and_mapped_type() {
    let input = "declare module \"svelte\" {\n}\n\ntype M = { [K in keyof JSON]: K }\n";
    assert_eq!(
        print_src(input, true),
        "declare module \"svelte\" {\n}\n\ntype M = {[K in keyof JSON]: K};"
    );
}

/// oxc preserves explicit parens as a `ParenthesizedExpression`; acorn (esrap's
/// own parser) elides them, so the printer unwraps them unconditionally and lets
/// precedence re-add what the grammar requires. A comment is not an exception:
/// reproducing the literal parens for one doubles whatever a parent adds.
/// Oracle: the Svelte compiler (esrap 2.x) on the equivalent module sources.
#[test]
fn redundant_parens_are_always_unwrapped() {
    assert_eq!(print_src("f((/* c */ x));", false), "f(/* c */ x);");
    assert_eq!(print_src("f((g(/* c */ x)));", false), "f(g(/* c */ x));");
    assert_eq!(print_src("f((x));", false), "f(x);");
    // Precedence still supplies the parens the grammar needs, exactly once.
    assert_eq!(
        print_src("async function f() {\n\t(await g(/* c */ x))();\n}", false),
        "async function f() {\n\t(await g(/* c */ x))();\n}"
    );
    assert_eq!(
        print_src("((/* c */ a + b)) * 2;", false),
        "(/* c */ a + b) * 2;"
    );
}

/// `ReturnStatement` is the ONE place esrap parenthesizes because of a comment:
/// when the next pending comment starts before the argument. The test is against
/// the *unwrapped* argument — esrap's acorn AST has no paren node, so oxc's
/// preserved parens would otherwise anchor the comparison at the `(`, which
/// precedes the comment, and the rule would never fire.
#[test]
fn return_argument_is_parenthesized_for_a_leading_comment() {
    assert_eq!(
        print_src("function f() {\n\treturn (/* c */ x);\n}", false),
        "function f() {\n\treturn (/* c */ x);\n}"
    );
    // A sequence keeps both layers: the return rule's, and its own.
    assert_eq!(
        print_src("function f() {\n\treturn (/* c */ a, b);\n}", false),
        "function f() {\n\treturn (/* c */ (a, b));\n}"
    );
    // The comment trails the argument — the rule does not fire.
    assert_eq!(
        print_src("function f() {\n\treturn (x /* c */);\n}", false),
        "function f() {\n\treturn x; /* c */\n}"
    );
}
