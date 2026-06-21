//! Port of esrap's `test/indent.test.js`: the `indent` option controls one
//! level of indentation.

use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_esrap::{PrintOptions, print_with};

const SRC: &str = "const foo = () => { const bar = 'baz' }";

fn print_indented(indent: &str) -> String {
    let alloc = Allocator::default();
    let ret = Parser::new(&alloc, SRC, SourceType::default().with_module(true)).parse();
    assert!(
        ret.diagnostics.is_empty(),
        "parse error: {:?}",
        ret.diagnostics
    );
    let opts = PrintOptions {
        indent: indent.to_string(),
        ..Default::default()
    };
    print_with(&ret.program, SRC, &opts)
}

#[test]
fn default_indent_is_tab() {
    assert_eq!(
        print_indented("\t"),
        "const foo = () => {\n\tconst bar = 'baz';\n};"
    );
}

#[test]
fn two_space_indent() {
    assert_eq!(
        print_indented("  "),
        "const foo = () => {\n  const bar = 'baz';\n};"
    );
}

#[test]
fn four_space_indent() {
    assert_eq!(
        print_indented("    "),
        "const foo = () => {\n    const bar = 'baz';\n};"
    );
}
