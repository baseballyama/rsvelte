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
        let (expression, end) =
            builder.read_expression_before(58, COMPONENT.len() as u32, SourceType::ts())?;
        let expression = builder.keep_expression(expression);
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
        (builder.read_expression_before(4, source.len() as u32, SourceType::mjs()))
            .map(drop)
            .map_err(Into::into)
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
    let (tree, pattern) = Tree::build(source, |builder| {
        Ok(builder.pattern(range, SourceType::ts())?)
    })
    .expect("parses");
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
        Ok(builder.recorded().iter().collect::<Vec<_>>())
    })
    .expect("parses");
    let texts = recorded
        .iter()
        .map(|r| r.span.text(source))
        .collect::<Vec<_>>();
    assert_eq!(texts, ["[", "x", "]"]);
}

#[test]
fn a_snippet_parameter_counts_its_parentheses_and_keeps_none() {
    let source = "{#snippet f(a = ((1)), b = (c).d, e = f)}";
    let (tree, parameters) = Tree::build(source, |builder| {
        Ok(builder.parameters(Span::new(12, 39), SourceType::mjs())?)
    })
    .expect("parses");
    let parameters = tree.get_parameters(parameters);
    let default = |i: usize| {
        parameters.items[i]
            .initializer
            .as_deref()
            .expect("a default")
    };
    let at = |span: oxc_span::Span| &source[span.start as usize..span.end as usize];
    assert!(matches!(
        default(0),
        oxc_ast::ast::Expression::NumericLiteral(_)
    ));
    assert_eq!(tree.parentheses(default(0).span()), 2);
    let oxc_ast::ast::Expression::StaticMemberExpression(member) = default(1) else {
        panic!("a member");
    };
    assert_eq!(at(member.object.span()), "c");
    assert_eq!(tree.parentheses(member.object.span()), 1);
    assert_eq!(tree.parentheses(default(1).span()), 0);
    assert_eq!(tree.parentheses(default(2).span()), 0);
}

#[test]
fn snippet_parameters_parse_in_place() {
    let source = "{#snippet f(a, b = 1, ...rest)}";
    let (tree, parameters) = Tree::build(source, |builder| {
        Ok(builder.parameters(Span::new(12, 29), SourceType::mjs())?)
    })
    .expect("parses");
    let parameters = tree.get_parameters(parameters);
    let at = |span: oxc_span::Span| &source[span.start as usize..span.end as usize];
    assert_eq!(parameters.items.len(), 2);
    assert_eq!(at(parameters.items[1].span), "b = 1");
    assert_eq!(at(parameters.rest.as_ref().expect("rest").span), "...rest");
}

#[test]
fn generics_parse_in_place_with_their_own_tokens() {
    let source = "<script generics=\"T extends Item = Default, U\">";
    let (tree, (parameters, recorded)) = Tree::build(source, |builder| {
        let parameters = builder.type_parameters(Span::new(18, 45), SourceType::ts())?;
        Ok((parameters, builder.recorded().iter().collect::<Vec<_>>()))
    })
    .expect("parses");
    let parameters = tree.get_type_parameters(parameters);
    let at = |span: oxc_span::Span| &source[span.start as usize..span.end as usize];
    assert_eq!(parameters.params.len(), 2);
    assert_eq!(at(parameters.params[0].span), "T extends Item = Default");
    assert_eq!(at(parameters.params[1].name.span), "U");
    let texts = recorded
        .iter()
        .map(|r| r.span.text(source))
        .collect::<Vec<_>>();
    assert_eq!(texts, ["T", "extends", "Item", "=", "Default", ",", "U"]);
}

#[test]
fn two_patterns_are_not_one() {
    let error = Tree::build("{#each x as a, b}", |builder| {
        Ok(builder.pattern(Span::new(12, 16), SourceType::mjs())?)
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

/// The host lets 1263 pass, which typescript-eslint throws.
const UNCHECKED: &[&str] = &["1263"];

#[test]
fn the_tree_keeps_the_errors_the_host_lets_pass() {
    let text = "let x!: number = 1;";
    let (tree, _) = Tree::build(text, |builder| {
        builder.leave_unchecked(&UNCHECKED);
        let range = Span::new(0, text.len() as u32);
        builder.program(range, SourceType::ts()).map_err(Into::into)
    })
    .expect("the host lets the error pass");
    let codes: Vec<_> = (tree.unchecked_errors().iter())
        .map(|error| error.typescript_code)
        .collect();
    assert_eq!(codes, [Some(1263)]);
}

#[test]
fn an_expression_records_the_parentheses_around_its_root_sequence_only() {
    for (source, pairs) in [
        ("(a, b)", 1),
        ("((a, b))", 2),
        ("a, b", 0),
        ("(a), b", 0),
        ("/* ( */ a, b", 0),
    ] {
        let mut sequence = None;
        let (tree, ()) = Tree::build(source, |builder| {
            let (expression, _) =
                builder.read_expression_before(0, source.len() as u32, SourceType::mjs())?;
            sequence = Some(expression.span());
            Ok(())
        })
        .expect("parses");
        let span = sequence.expect("read");
        assert_eq!(tree.parentheses(span), pairs, "{source}");
    }
}

/// The statements and the holes of `source` read with holes, and the tokens recorded.
fn read_with_holes(source: &str) -> (Vec<&str>, Vec<&str>, Vec<&str>) {
    read_with_holes_as(source, SourceType::tsx())
}

fn read_with_holes_as(source: &str, source_type: SourceType) -> (Vec<&str>, Vec<&str>, Vec<&str>) {
    let whole = Span::new(0, source.len() as u32);
    let (tree, (program, holes, recorded)) = Tree::build(source, |builder| {
        let read = builder.program_with_holes(whole, source_type);
        let recorded = builder
            .recorded()
            .iter()
            .map(|r| r.span)
            .collect::<Vec<_>>();
        Ok((read.program, read.holes, recorded))
    })
    .expect("reads");
    let at = |span: oxc_span::Span| &source[span.start as usize..span.end as usize];
    let statements = tree
        .get_program(program)
        .body
        .iter()
        .map(|s| at(s.span()))
        .collect();
    let holes = holes.iter().map(|hole| hole.text(source)).collect();
    let recorded = recorded.into_iter().map(|span| span.text(source)).collect();
    (statements, holes, recorded)
}

#[test]
fn a_program_that_parses_has_no_holes() {
    let (statements, holes, _) = read_with_holes("let a = 1;\nlet b = 2;\n");
    assert_eq!(statements, ["let a = 1;", "let b = 2;"]);
    assert_eq!(holes, Vec::<&str>::new());
}

#[test]
fn a_statement_that_stops_is_a_hole_up_to_the_token_it_stopped_at() {
    let (statements, holes, recorded) = read_with_holes("const x = (;\nlet y = 1;\n");
    assert_eq!(statements, [";", "let y = 1;"]);
    assert_eq!(holes, ["const x = ("]);
    assert_eq!(
        recorded,
        ["const", "x", "=", "(", ";", "let", "y", "=", "1", ";"]
    );
}

#[test]
fn a_token_no_statement_starts_with_is_skipped() {
    let (statements, holes, _) = read_with_holes("let n = 1;\n}\nlet z = 1;\n");
    assert_eq!(statements, ["let n = 1;", "let z = 1;"]);
    assert_eq!(holes, ["}"]);
}

#[test]
fn a_statement_cut_short_by_the_end_is_a_hole_to_its_last_token() {
    let (statements, holes, _) = read_with_holes("let n = 1;\nfunction f() {\n");
    assert_eq!(statements, ["let n = 1;"]);
    assert_eq!(holes, ["function f() {"]);
}

#[test]
fn skips_with_no_statement_between_are_one_hole() {
    let (statements, holes, _) = read_with_holes("const a = [;\nconst b = 2;\nf(a b, c);\n");
    assert_eq!(holes, ["const a = [", "f(a b, c)"]);
    assert_eq!(statements, [";", "const b = 2;", ";"]);
}

#[test]
fn a_token_the_lexer_cannot_finish_resumes_where_typescript_s_scanner_does() {
    let after = "let n = 1;\nexport function f() {}\n";
    let cases = [
        // A string ends at the line terminator.
        ("const s = 'abc;\n", SourceType::tsx(), "const s = 'abc;\n"),
        // A regular expression ends before the whitespace and `;` that end its line.
        ("const r = /abc;\n", SourceType::tsx(), "const r = /abc"),
        (
            "const el = <b>x</b>;\n",
            SourceType::ts(),
            "const el = <b>x</b>",
        ),
        // An invalid character is skipped alone.
        ("#;\n", SourceType::tsx(), "#"),
    ];
    for (broken, source_type, hole) in cases {
        let source = format!("{broken}{after}");
        let (statements, holes, _) = read_with_holes_as(&source, source_type);
        let rest: &[&str] = if broken.starts_with("const s") {
            &["let n = 1;", "export function f() {}"]
        } else {
            &[";", "let n = 1;", "export function f() {}"]
        };
        assert_eq!(statements, rest, "{broken:?}");
        assert_eq!(holes, [hole], "{broken:?}");
    }
    // A template or a block comment runs to the end.
    for broken in ["const t = `abc;\n", "/* abc\n"] {
        let source = format!("{broken}{after}");
        let (statements, ..) = read_with_holes(&source);
        assert_eq!(statements, Vec::<&str>::new(), "{broken:?}");
    }
}

#[test]
fn an_unterminated_regular_expression_ends_where_typescript_s_rescan_ends_it() {
    // The regular expression's end from TypeScript 6.0.3's `reScanSlashToken`, then the hole the
    // statement leaves and the statement after it.
    for (line, regular_expression, hole) in [
        ("foo(/abc); let n = 1;", "/abc", &["foo(/abc)"][..]),
        ("foo([/abc]); let n = 1;", "/abc", &["foo([/abc])"]),
        ("foo(/a(b)c); let n = 1;", "/a(b)c", &["foo(/a(b)c)"]),
        ("foo(/abc) ;  let n = 1;", "/abc", &["foo(/abc)"]),
        ("foo(/a[)]c); let n = 1;", "/a[)]c", &["foo(/a[)]c)"]),
        ("foo(/a{2)}b); let n = 1;", "/a{2)}b", &["foo(/a{2)}b)"]),
        ("foo(/a\\)b); let n = 1;", "/a\\)b", &["foo(/a\\)b)"]),
        // The `;` it leaves out is an empty statement.
        ("foo(/a\u{3000};); let n = 1;", "/a", &["foo(/a", ")"]),
    ] {
        assert!(hole.concat().contains(regular_expression), "{line:?}");
        let source = format!("{line}\nlet m = 2;\n");
        let (statements, holes, _) = read_with_holes(&source);
        assert_eq!(holes, hole, "{line:?}");
        assert_eq!(statements.last(), Some(&"let m = 2;"), "{line:?}");
        assert!(
            statements.contains(&"let n = 1;"),
            "{line:?}: {statements:?}"
        );
    }
    // With no unbalanced bracket, it ends at the line terminator, without its last `;`.
    let (statements, holes, _) = read_with_holes("/abc let n = 1;\nlet m = 2;\n");
    assert_eq!(holes, ["/abc let n = 1"]);
    assert_eq!(statements, [";", "let m = 2;"]);
}

#[test]
fn a_hole_contains_the_spans_inside_it_only() {
    let source = "let n = 1;\n}\nlet m = 2;\nlet z = (;\n";
    let whole = Span::new(0, source.len() as u32);
    let (_, holes) = Tree::build(source, |builder| {
        Ok(builder.program_with_holes(whole, SourceType::tsx()).holes)
    })
    .expect("reads");
    assert_eq!(
        holes
            .iter()
            .map(|hole| hole.text(source))
            .collect::<Vec<_>>(),
        ["}", "let z = ("]
    );
    assert!(holes.contains(Span::new(11, 12)));
    assert!(holes.contains(Span::new(28, 31)));
    assert!(!holes.contains(Span::new(4, 5)));
    assert!(!holes.contains(Span::new(11, 24)));
}
