use oxc_span::{GetSpan, SourceType};
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::Span;

use super::Tree;

fn document(text: &str) -> Document {
    Document::new("Component.svelte".to_owned(), text.to_owned()).expect("small")
}

const COMPONENT: &str =
    "<script lang=\"ts\">let a: number = 1; // one\n</script>\n<p>{a + 1}</p>\n";

fn text(span: oxc_span::Span) -> &'static str {
    &COMPONENT[span.start as usize..span.end as usize]
}

#[test]
fn a_script_and_a_template_expression_parse_in_place() {
    let script = Span::new(18, 44);
    let mut parts = None;
    let tree = Tree::build(&document(COMPONENT), |builder| {
        let program = builder.program(script, SourceType::ts())?;
        let (expression, end) = builder.expression_at(58, SourceType::ts())?;
        parts = Some((program, expression, end));
        Ok(())
    })
    .expect("parses");
    let (program, expression, end) = parts.expect("built");
    let program = tree.get_program(program);
    assert_eq!((program.span.start, program.span.end), (18, 44));
    assert_eq!(text(program.body[0].span()), "let a: number = 1;");
    assert_eq!(text(program.comments[0].span), "// one");
    assert_eq!(text(tree.get_expression(expression).span()), "a + 1");
    assert_eq!(COMPONENT.as_bytes()[end as usize], b'}');
    assert_eq!(tree.source_text(), COMPONENT);
}

#[test]
fn an_error_points_into_the_document() {
    let source = "<p>{a +}</p>";
    let error = Tree::build(&document(source), |builder| {
        builder.expression_at(4, SourceType::mjs()).map(drop)
    })
    .expect_err("a syntax error");
    assert_eq!(error.code, "parse_error");
    assert!((4..=8).contains(&error.span.start_offset), "{error:?}");
}

#[test]
fn a_typescript_file_is_one_program() {
    let tree = Tree::program(
        &document("type A = { b: string };\nlet c: A;\n"),
        SourceType::ts(),
    )
    .expect("parses");
    assert_eq!(tree.get_program(super::ProgramIdentifier(0)).body.len(), 2);
}
