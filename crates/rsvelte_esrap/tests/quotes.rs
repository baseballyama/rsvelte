//! Port of esrap's `test/quotes.test.js`.
//!
//! esrap prefers a literal's preserved `raw` spelling; the JS test strips `raw`
//! (`clean`) so the quote-preference + escaping path runs. We do the same with a
//! `VisitMut` that nulls every `StringLiteral.raw`, then print with the chosen
//! `QuoteStyle`.

use oxc_allocator::Allocator;
use oxc_ast::ast::StringLiteral;
use oxc_ast_visit::VisitMut;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_esrap::{PrintOptions, QuoteStyle, print_with};

struct StripRaw;
impl<'a> VisitMut<'a> for StripRaw {
    fn visit_string_literal(&mut self, it: &mut StringLiteral<'a>) {
        it.raw = None;
    }
}

fn print_stripped(source: &str, quote: QuoteStyle) -> String {
    let alloc = Allocator::default();
    let mut ret = Parser::new(&alloc, source, SourceType::default().with_module(true)).parse();
    assert!(
        ret.diagnostics.is_empty(),
        "parse error: {:?}",
        ret.diagnostics
    );
    StripRaw.visit_program(&mut ret.program);
    let opts = PrintOptions {
        quote,
        ..Default::default()
    };
    print_with(&ret.program, source, &opts)
}

#[test]
fn default_quote_is_single() {
    assert_eq!(
        print_stripped("const foo = 'bar'", QuoteStyle::Single),
        "const foo = 'bar';"
    );
}

#[test]
fn single_quotes_when_single() {
    assert_eq!(
        print_stripped("const foo = 'bar'", QuoteStyle::Single),
        "const foo = 'bar';"
    );
}

#[test]
fn double_quotes_when_double() {
    assert_eq!(
        print_stripped("const foo = 'bar'", QuoteStyle::Double),
        "const foo = \"bar\";"
    );
}

#[test]
fn escape_single_quotes_in_literal() {
    // source: const foo = "b'ar"  → value b'ar → single-quoted: 'b\'ar'
    assert_eq!(
        print_stripped("const foo = \"b'ar\"", QuoteStyle::Single),
        "const foo = 'b\\'ar';"
    );
}

#[test]
fn escape_double_quotes_in_literal() {
    // source: const foo = 'b"ar' → value b"ar → double-quoted: "b\"ar"
    assert_eq!(
        print_stripped("const foo = 'b\"ar'", QuoteStyle::Double),
        "const foo = \"b\\\"ar\";"
    );
}

#[test]
fn escapes_new_lines() {
    // source string "a\nb" → value a<LF>b → 'a\nb'
    assert_eq!(
        print_stripped("const str = \"a\\nb\"", QuoteStyle::Single),
        "const str = 'a\\nb';"
    );
}

#[test]
fn escapes_escape_characters() {
    // source string "a\\nb" → value a\nb (backslash, n) → 'a\\nb'
    assert_eq!(
        print_stripped("const str = \"a\\\\nb\"", QuoteStyle::Single),
        "const str = 'a\\\\nb';"
    );
}

#[test]
fn escapes_double_escaped_backslashes() {
    // source $.text('\\\\') → value \\ (two backslashes) → '\\\\'
    assert_eq!(
        print_stripped("var text = $.text('\\\\\\\\');", QuoteStyle::Single),
        "var text = $.text('\\\\\\\\');"
    );
}

#[test]
fn does_not_double_escape_single_quotes() {
    // source 'a\'b' → value a'b → 'a\'b'
    assert_eq!(
        print_stripped("const str = 'a\\'b'", QuoteStyle::Single),
        "const str = 'a\\'b';"
    );
}

#[test]
fn does_not_escape_non_preferred_quote() {
    // source "a\"b" → value a"b → single-quoted leaves the double quote: 'a"b'
    assert_eq!(
        print_stripped("const str = \"a\\\"b\"", QuoteStyle::Single),
        "const str = 'a\"b';"
    );
}

#[test]
fn handles_n_r() {
    // source "a\n\rb" → value a<LF><CR>b → 'a\n\rb'
    assert_eq!(
        print_stripped("const str = \"a\\n\\rb\"", QuoteStyle::Single),
        "const str = 'a\\n\\rb';"
    );
}
