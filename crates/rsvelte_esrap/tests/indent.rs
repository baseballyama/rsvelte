//! Port of esrap's `test/indent.test.js`, restricted to the one indentation
//! unit rsvelte prints with: a tab.

use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_esrap::print;

const SRC: &str = "const foo = () => { const bar = 'baz' }";

#[test]
fn indent_is_tab() {
    let alloc = Allocator::default();
    let ret = Parser::new(&alloc, SRC, SourceType::default().with_module(true)).parse();
    assert!(
        ret.diagnostics.is_empty(),
        "parse error: {:?}",
        ret.diagnostics
    );
    assert_eq!(
        print(&ret.program, SRC),
        "const foo = () => {\n\tconst bar = 'baz';\n};"
    );
}
