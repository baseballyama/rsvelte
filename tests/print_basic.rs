//! Basic tests for the print module.
//!
//! These tests verify that the print module can convert AST nodes back to source code.

use svelte_compiler_rust::compiler::print::print;
use svelte_compiler_rust::{ParseOptions, parse};

#[test]
fn test_print_simple_text() {
    let source = "Hello World";
    let parse_options = ParseOptions {
        modern: true,
        ..Default::default()
    };
    let ast = parse(source, parse_options).unwrap();
    let result = print(&ast, None).unwrap();
    assert!(result.code.contains("Hello World"));
}

#[test]
fn test_print_simple_element() {
    let source = "<h1>Hello World</h1>";
    let parse_options = ParseOptions {
        modern: true,
        ..Default::default()
    };
    let ast = parse(source, parse_options).unwrap();
    let result = print(&ast, None).unwrap();
    assert!(result.code.contains("<h1>"));
    assert!(result.code.contains("Hello World"));
    assert!(result.code.contains("</h1>"));
}

#[test]
fn test_print_element_with_attributes() {
    let source = r#"<div class="test">Content</div>"#;
    let parse_options = ParseOptions {
        modern: true,
        ..Default::default()
    };
    let ast = parse(source, parse_options).unwrap();
    let result = print(&ast, None).unwrap();
    assert!(result.code.contains("<div"));
    assert!(result.code.contains("class"));
    assert!(result.code.contains("test"));
    assert!(result.code.contains("Content"));
    assert!(result.code.contains("</div>"));
}

#[test]
fn test_print_self_closing_element() {
    let source = "<input />";
    let parse_options = ParseOptions {
        modern: true,
        ..Default::default()
    };
    let ast = parse(source, parse_options).unwrap();
    let result = print(&ast, None).unwrap();
    assert!(result.code.contains("<input"));
    assert!(result.code.contains("/>"));
}

#[test]
fn test_print_nested_elements() {
    let source = "<div><p>Nested</p></div>";
    let parse_options = ParseOptions {
        modern: true,
        ..Default::default()
    };
    let ast = parse(source, parse_options).unwrap();
    let result = print(&ast, None).unwrap();
    assert!(result.code.contains("<div>"));
    assert!(result.code.contains("<p>"));
    assert!(result.code.contains("Nested"));
    assert!(result.code.contains("</p>"));
    assert!(result.code.contains("</div>"));
}

#[test]
fn test_print_comment() {
    let source = "<!-- This is a comment -->";
    let parse_options = ParseOptions {
        modern: true,
        ..Default::default()
    };
    let ast = parse(source, parse_options).unwrap();
    let result = print(&ast, None).unwrap();
    assert!(result.code.contains("<!--"));
    assert!(result.code.contains("This is a comment"));
    assert!(result.code.contains("-->"));
}

#[test]
fn test_print_preserves_structure() {
    let source = r#"
<div>
    <h1>Title</h1>
    <p>Paragraph</p>
</div>
"#;
    let parse_options = ParseOptions {
        modern: true,
        ..Default::default()
    };
    let ast = parse(source, parse_options).unwrap();
    let result = print(&ast, None).unwrap();

    // Check that all elements are present
    assert!(result.code.contains("<div>"));
    assert!(result.code.contains("<h1>"));
    assert!(result.code.contains("Title"));
    assert!(result.code.contains("<p>"));
    assert!(result.code.contains("Paragraph"));
}
