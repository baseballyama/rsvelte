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
    ] {
        assert!(parses(source_text, false), "{source_text}");
    }
}
