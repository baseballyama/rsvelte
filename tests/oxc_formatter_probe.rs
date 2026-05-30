//! SPIKE: confirms that oxc_parser's `Program<'a>` type unifies with
//! oxc_formatter's expected input across the crate boundary. If the patch
//! block in Cargo.toml didn't unify the AST source units, this test would
//! fail to compile with E0308 "expected struct `oxc_ast::Program`, found a
//! different `oxc_ast::Program`".
//!
//! Run: `cargo test --test oxc_formatter_probe -- --nocapture`

use oxc_allocator::Allocator;
use oxc_formatter::{Formatter, JsFormatOptions};
use oxc_parser::Parser;
use oxc_span::SourceType;

#[test]
fn formats_unformatted_js() {
    let allocator = Allocator::default();
    let source = "let x=1+2;function f(a,b){return a+b}";
    let parser_ret = Parser::new(&allocator, source, SourceType::default()).parse();

    assert!(
        parser_ret.errors.is_empty(),
        "parse errors: {:?}",
        parser_ret.errors
    );

    let formatted = Formatter::new(&allocator, JsFormatOptions::new()).build(&parser_ret.program);

    println!("--- input ---\n{source}\n--- output ---\n{formatted}");

    assert!(
        formatted.contains("let x = 1 + 2"),
        "expected spaced binary op, got:\n{formatted}"
    );
    assert!(
        formatted.contains("function f(a, b)"),
        "expected spaced params, got:\n{formatted}"
    );
}
