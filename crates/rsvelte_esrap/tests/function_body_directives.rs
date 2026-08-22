//! A leading string-literal statement in a function body is `FunctionBody::directives`
//! in oxc, not `statements`, so a printer that walks `statements` alone deletes it.
//! Only the first such statement of a body is a directive, which is what made the
//! deletion look semantics-preserving: `'x'; f();` printed as `f();`.

use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_esrap::print;

fn printed(input: &str) -> String {
    let alloc = Allocator::default();
    let ret = Parser::new(&alloc, input, SourceType::default().with_module(true)).parse();
    assert!(
        ret.diagnostics.is_empty(),
        "parse error: {:?}",
        ret.diagnostics
    );
    print(&ret.program, input)
}

#[test]
fn a_directive_in_a_function_body_survives_printing() {
    for input in [
        "const f = () => {\n\t'click dont save';\n\tg(false);\n};",
        "function h() {\n\t'use strict';\n\treturn 1;\n}",
        "const o = {\n\tm() {\n\t\t'note';\n\t\treturn 1;\n\t}\n};",
        "class C {\n\tm() {\n\t\t'note';\n\t}\n}",
        "const empty = () => {\n\t'only a directive';\n};",
    ] {
        let code = printed(input);
        let directive = input
            .lines()
            .find(|line| line.trim().starts_with('\'') && line.trim().ends_with("';"))
            .expect("the input has a directive");
        assert!(
            code.contains(directive.trim()),
            "directive {directive:?} dropped from:\n{code}"
        );
    }
}
