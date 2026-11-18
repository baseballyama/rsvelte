use oxc_allocator::Allocator;
use oxc_ast::ast::Program;
use oxc_span::{SPAN, SourceType};

use super::Builder;

#[test]
fn a_template_literal_keeps_its_cooked_text() {
    let allocator = Allocator::default();
    let b = Builder::new(&allocator);
    let value = b.template(["a`b", "${c}"], [b.member(b.id("_ctx"), "y")]);
    let program = Program::new(
        SPAN,
        SourceType::mjs(),
        "",
        [],
        None,
        [],
        b.vec([b.const_("x", value)]),
        &b,
    );
    assert_eq!(
        crate::print::print(&program),
        "const x = `a\\`b${_ctx.y}\\${c}`;\n"
    );
}
