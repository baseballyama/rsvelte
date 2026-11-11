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
    let (tree, (program, expression, end)) = Tree::build(COMPONENT, |builder| {
        let program = builder.program(script, SourceType::ts())?;
        let (expression, end) = builder.expression_at(58, SourceType::ts())?;
        Ok((program, expression, end))
    })
    .expect("parses");
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
    let error = Tree::build(source, |builder| {
        builder.expression_at(4, SourceType::mjs()).map(drop)
    })
    .expect_err("a syntax error");
    assert_eq!(error.code, "parse_error");
    assert!((4..=8).contains(&error.span.start_offset), "{error:?}");
}

#[test]
fn a_typescript_file_is_one_program_without_parentheses() {
    let (tree, root) =
        Tree::program(&document("let c = (1 + 2) * 3;\n"), SourceType::ts()).expect("parses");
    let program = tree.get_program(root);
    assert_eq!(program.body.len(), 1);
    let oxc_ast::ast::Statement::VariableDeclaration(declaration) = &program.body[0] else {
        panic!("a declaration");
    };
    let Some(oxc_ast::ast::Expression::BinaryExpression(product)) =
        &declaration.declarations[0].init
    else {
        panic!("a product");
    };
    assert!(matches!(
        product.left,
        oxc_ast::ast::Expression::BinaryExpression(_)
    ));
}

#[test]
fn a_pattern_parses_in_place_with_its_type() {
    let source = "{#each items as { a, b }: Item /* c */}";
    let range = Span::new(16, 38);
    let (tree, pattern) =
        Tree::build(source, |builder| builder.pattern(range, SourceType::ts())).expect("parses");
    let pattern = tree.get_pattern(pattern);
    let at = |span: oxc_span::Span| &source[span.start as usize..span.end as usize];
    assert_eq!(at(pattern.pattern.span()), "{ a, b }");
    assert_eq!(
        at(pattern.type_annotation.as_ref().expect("typed").span()),
        ": Item"
    );
    assert_eq!(at(tree.comments()[0].span), "/* c */");
}

#[test]
fn a_pattern_records_its_own_tokens_only() {
    let source = "{:then [x]}";
    let (_, recorded) = Tree::build(source, |builder| {
        builder.pattern(Span::new(7, 10), SourceType::mjs())?;
        Ok(builder.recorded().to_vec())
    })
    .expect("parses");
    let texts = recorded
        .iter()
        .map(|r| r.span.text(source))
        .collect::<Vec<_>>();
    assert_eq!(texts, ["[", "x", "]"]);
}

#[test]
fn snippet_parameters_parse_in_place() {
    let source = "{#snippet f(a, b = 1, ...rest)}";
    let (tree, parameters) = Tree::build(source, |builder| {
        builder.parameters(Span::new(12, 29), SourceType::mjs())
    })
    .expect("parses");
    let parameters = tree.get_parameters(parameters);
    let at = |span: oxc_span::Span| &source[span.start as usize..span.end as usize];
    assert_eq!(parameters.items.len(), 2);
    assert_eq!(at(parameters.items[1].span), "b = 1");
    assert_eq!(at(parameters.rest.as_ref().expect("rest").span), "...rest");
}

#[test]
fn two_patterns_are_not_one() {
    let error = Tree::build("{#each x as a, b}", |builder| {
        builder.pattern(Span::new(12, 16), SourceType::mjs())
    })
    .expect_err("two patterns");
    assert_eq!(error.span, Span::new(12, 16));
}

#[test]
fn a_declaration_tag_reads_one_statement() {
    let source = "{let a = /}/.source, b = 2}";
    let (_, (end, declarators)) = Tree::build(source, |builder| {
        let (statement, end) = builder.read_statement_at(1, SourceType::mjs())?;
        let oxc_ast::ast::Statement::VariableDeclaration(declaration) = statement else {
            panic!("a declaration");
        };
        Ok((end, declaration.declarations.len()))
    })
    .expect("parses");
    assert_eq!((end, declarators), (26, 2));
}

#[test]
fn a_built_program_is_kept_beside_the_parsed_ones() {
    let (tree, (parsed, built)) = Tree::build(COMPONENT, |builder| {
        let parsed = builder.program(Span::new(18, 44), SourceType::ts())?;
        let nodes = builder.nodes();
        let program = oxc_ast::ast::Program::new(
            oxc_span::Span::new(0, 0),
            SourceType::mjs(),
            COMPONENT,
            [],
            None,
            [],
            [],
            &nodes,
        );
        Ok((parsed, builder.keep_program(program)))
    })
    .expect("parses");
    assert_ne!(parsed, built);
    assert_eq!(tree.get_program(parsed).body.len(), 1);
    assert!(tree.get_program(built).body.is_empty());
}

#[test]
fn built_parameters_are_kept() {
    let (tree, kept) = Tree::build(COMPONENT, |builder| {
        let nodes = builder.nodes();
        let parameters = oxc_ast::ast::FormalParameters::new(
            oxc_span::Span::new(0, 0),
            oxc_ast::ast::FormalParameterKind::ArrowFormalParameters,
            [],
            None,
            &nodes,
        );
        Ok(builder.keep_parameters(parameters))
    })
    .expect("builds");
    assert!(tree.get_parameters(kept).items.is_empty());
}
