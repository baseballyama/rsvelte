use oxc_allocator::Allocator;
use oxc_ast::ast::Program;
use oxc_span::{SPAN, SourceType};
use rsvelte_typescript_compile::print::print;

use super::Template;
use crate::lower::Builder;

#[test]
fn a_statement_ends_the_push_before_it_and_text_after_it_opens_another() {
    let allocator = Allocator::default();
    let b = Builder::new(&allocator);
    let mut template = Template::new(&b);
    template.text("<a>");
    template.expression(b.id("x"));
    template.text_fmt(format_args!("{}", "</a>"));
    template.statement(b.statement(b.id("s")));
    template.text("<b>");
    template.quasis(vec!["c".into(), "d".into()], vec![b.id("y")]);
    template.statements([b.statement(b.id("t")), b.statement(b.id("u"))]);
    template.expression(b.id("z"));
    let statements = template.finish();
    let program = Program::new(
        SPAN,
        SourceType::mjs(),
        "",
        [],
        None,
        [],
        b.vec(statements),
        &b,
    );
    assert_eq!(
        print(&program),
        "$$renderer.push(`<a>${x}</a>`);\ns;\n$$renderer.push(`<b>c${y}d`);\nt;\nu;\n\
         $$renderer.push(`${z}`);\n"
    );
}

#[test]
fn an_empty_template_pushes_nothing() {
    let allocator = Allocator::default();
    let b = Builder::new(&allocator);
    let mut template = Template::new(&b);
    template.statement(b.statement(b.id("s")));
    assert_eq!(template.finish().len(), 1);
}
