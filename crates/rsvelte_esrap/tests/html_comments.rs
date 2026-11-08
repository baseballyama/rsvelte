//! An Annex B HTML-like comment (`<!--` / `-->`) is a single-line comment —
//! acorn reports it as `Line` with the text after the delimiter as its value.
//! OXC gives it its own `CommentKind`, which a `kind == Line` test reads as a
//! block comment.

use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_esrap::{PrintOptions, print_with_map};

fn print_script(source: &str) -> String {
    let alloc = Allocator::default();
    let ret = Parser::new(&alloc, source, SourceType::cjs()).parse();
    assert!(
        ret.diagnostics.is_empty(),
        "parse error: {:?}",
        ret.diagnostics
    );
    assert!(!ret.program.comments.is_empty(), "no comment was collected");
    print_with_map(&ret.program, source, &PrintOptions::default()).code
}

#[test]
fn an_html_open_comment_prints_as_a_line_comment() {
    let out = print_script("let a = 1; <!-- open\nlet b = 2;\n");
    assert!(out.contains("// open\n"), "{out}");
    assert!(!out.contains("/*"), "{out}");
}

#[test]
fn an_html_close_comment_prints_as_a_line_comment() {
    let out = print_script("let a = 1;\n--> close\nlet b = 2;\n");
    assert!(out.contains("// close\n"), "{out}");
    assert!(!out.contains("/*"), "{out}");
}
