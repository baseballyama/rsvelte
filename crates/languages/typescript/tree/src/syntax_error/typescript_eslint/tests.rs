use oxc_span::SourceType;
use rsvelte_kernel::source::positions::Span;

use crate::Tree;

/// What typescript-eslint throws for `text`, a TypeScript program, and at which byte.
fn thrown(text: &str) -> Option<(String, u32)> {
    let mut thrown = None;
    let parsed = Tree::build(text, |builder| {
        let range = Span::new(0, text.len() as u32);
        builder.program(range, SourceType::ts()).map_err(|error| {
            thrown = error
                .typescript_eslint_message()
                .map(|message| (message.into_owned(), error.diagnostic.span.start_offset));
            error.into()
        })
    });
    assert!(parsed.is_err(), "{text:?} parses");
    thrown
}

#[test]
fn a_missing_token_is_the_token_tsc_expected_where_it_reads_the_next() {
    for (text, message, at) in [
        ("foo(;", "')' expected.", 4),
        ("foo(a b);", "',' expected.", 6),
        ("let a = 1 let b = 2;", "',' expected.", 10),
        ("a = b c;", "';' expected.", 6),
        ("const a = {", "'}' expected.", 11),
    ] {
        assert_eq!(thrown(text), Some((message.to_owned(), at)), "{text:?}");
    }
}

#[test]
fn a_token_that_cannot_start_an_expression_or_a_type_is_where_one_is_expected() {
    assert_eq!(
        thrown("let a = ;"),
        Some(("Expression expected.".to_owned(), 8))
    );
    assert_eq!(
        thrown("const q = (;"),
        Some(("Expression expected.".to_owned(), 11))
    );
    assert_eq!(
        thrown("let a: = 1;"),
        Some(("Type expected.".to_owned(), 7))
    );
}

#[test]
fn a_lone_name_before_a_token_on_its_line_is_an_unknown_keyword() {
    assert_eq!(
        thrown("assert { a: 1 };"),
        Some((
            "Unknown keyword or identifier. Did you mean 'asserts'?".to_owned(),
            0
        ))
    );
    for (text, suggestion) in [
        ("interfaceFoo {}", "interface"),
        ("functionabcdef {}", "function abcdef"),
        ("constructorabcdef x", "const ructorabcdef"),
    ] {
        let message = format!("Unknown keyword or identifier. Did you mean '{suggestion}'?");
        assert_eq!(thrown(text), Some((message, 0)), "{text:?}");
    }
    assert_eq!(
        thrown("zzz yyy;"),
        Some(("Unexpected keyword or identifier.".to_owned(), 0))
    );
}

#[test]
fn a_quoted_name_fills_the_message() {
    assert_eq!(
        thrown("class A { declare constructor() {} }"),
        Some((
            "'declare' modifier cannot appear on class elements of this kind.".to_owned(),
            10
        ))
    );
    assert_eq!(
        thrown("interface I { public a: string }"),
        Some((
            "'public' modifier cannot appear on a type member".to_owned(),
            14
        ))
    );
}

#[test]
fn an_error_typescript_eslint_lets_through_has_no_message() {
    assert_eq!(thrown("import(...a);"), None);
}

/// What typescript-eslint throws for `text`, from all of oxc's errors, and at which byte.
fn thrown_of_all(text: &str) -> Option<(String, u32)> {
    let allocator = oxc_allocator::Allocator::default();
    let errors: Vec<_> = oxc_parser::Parser::new(&allocator, text, SourceType::ts())
        .parse()
        .diagnostics
        .into_iter()
        .map(|error| crate::syntax_error([error], text, 0, 0))
        .collect();
    let error = super::typescript_eslint_error(&errors)?;
    let message = error.typescript_eslint_message()?.into_owned();
    Some((message, error.diagnostic.span.start_offset))
}

#[test]
fn tsc_s_parser_error_wins_over_a_check_oxc_reported_first() {
    let text = "let accessor: any; const q = (accessor satisfies string);";
    assert_eq!(
        thrown_of_all(text),
        Some((
            "',' expected.".to_owned(),
            text.find("string").unwrap() as u32
        ))
    );
}

#[test]
fn a_check_typescript_eslint_makes_is_thrown_when_tsc_s_parser_finds_nothing() {
    assert_eq!(
        thrown_of_all("interface I { public a: string }"),
        Some((
            "'public' modifier cannot appear on a type member".to_owned(),
            14
        ))
    );
}
