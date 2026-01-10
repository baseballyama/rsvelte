//! Helper functions for the print module.
//!
//! This module provides utility functions used during the printing process,
//! such as formatting blocks and handling attributes.

use super::Context;

/// Threshold for when content should be formatted on separate lines.
///
/// If the measured length of content exceeds this threshold, it will be
/// formatted with newlines and indentation instead of inline.
pub const LINE_BREAK_THRESHOLD: usize = 50;

/// Format a block of content with optional inline formatting.
///
/// This function processes a node in a child context and decides whether to
/// format it inline or with newlines and indentation.
///
/// # Arguments
///
/// * `context` - The parent context to append to
/// * `visit_fn` - A function that visits the node and writes to the context
/// * `allow_inline` - Whether to allow inline formatting
///
/// # Behavior
///
/// - If the child context is empty, nothing is added
/// - If `allow_inline` is true and the child is single-line, it's appended inline
/// - Otherwise, the content is formatted with newlines and indentation
pub fn block<F>(context: &mut Context, visit_fn: F, allow_inline: bool)
where
    F: FnOnce(&mut Context),
{
    let mut child_context = context.child();
    visit_fn(&mut child_context);

    if child_context.empty() {
        return;
    }

    if allow_inline && !child_context.multiline {
        context.append(&child_context);
    } else {
        context.indent();
        context.newline();
        context.append(&child_context);
        context.dedent();
        context.newline();
    }
}

/// Check if an HTML element is void (self-closing).
///
/// Void elements in HTML5 do not have closing tags.
///
/// # Arguments
///
/// * `name` - The element name to check
///
/// # Returns
///
/// Returns true if the element is a void element.
pub fn is_void_element(name: &str) -> bool {
    matches!(
        name.to_lowercase().as_str(),
        "area"
            | "base"
            | "br"
            | "col"
            | "embed"
            | "hr"
            | "img"
            | "input"
            | "link"
            | "meta"
            | "param"
            | "source"
            | "track"
            | "wbr"
    )
}

/// Format JavaScript/TypeScript expression using oxc_codegen.
///
/// This function converts an oxc AST expression into a string representation.
///
/// # Arguments
///
/// * `_expr` - The oxc expression to format
///
/// # Returns
///
/// Returns the formatted expression as a string.
#[allow(dead_code)]
pub fn format_expression(_expr: &oxc_ast::ast::Expression) -> String {
    // TODO: This is a simplified implementation
    // We need to properly integrate oxc_codegen
    // For now, return a placeholder
    "/* expression */".to_string()
}

/// Format JavaScript/TypeScript statement using oxc_codegen.
///
/// This function converts an oxc AST statement into a string representation.
///
/// # Arguments
///
/// * `_stmt` - The oxc statement to format
///
/// # Returns
///
/// Returns the formatted statement as a string.
#[allow(dead_code)]
pub fn format_statement(_stmt: &oxc_ast::ast::Statement) -> String {
    // TODO: This is a simplified implementation
    // We need to properly integrate oxc_codegen
    // For now, return a placeholder
    "/* statement */".to_string()
}

/// Escape a string for use in HTML attributes.
///
/// This escapes quotes and special characters for safe attribute values.
///
/// # Arguments
///
/// * `s` - The string to escape
///
/// # Returns
///
/// Returns the escaped string.
pub fn escape_attribute_value(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('"', "&quot;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
}

/// Escape a string for use in HTML text content.
///
/// This escapes HTML special characters.
///
/// # Arguments
///
/// * `s` - The string to escape
///
/// # Returns
///
/// Returns the escaped string.
pub fn escape_html(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
}

#[cfg(test)]
mod tests {
    use super::*;
    use oxc_allocator::Allocator;

    #[test]
    fn test_is_void_element() {
        assert!(is_void_element("input"));
        assert!(is_void_element("br"));
        assert!(is_void_element("img"));
        assert!(is_void_element("INPUT")); // Case insensitive
        assert!(!is_void_element("div"));
        assert!(!is_void_element("span"));
    }

    #[test]
    fn test_escape_attribute_value() {
        assert_eq!(escape_attribute_value("hello"), "hello");
        assert_eq!(escape_attribute_value("a\"b"), "a&quot;b");
        assert_eq!(escape_attribute_value("a<b>c"), "a&lt;b&gt;c");
        assert_eq!(escape_attribute_value("a&b"), "a&amp;b");
    }

    #[test]
    fn test_escape_html() {
        assert_eq!(escape_html("hello"), "hello");
        assert_eq!(escape_html("a<b>c"), "a&lt;b&gt;c");
        assert_eq!(escape_html("a&b"), "a&amp;b");
    }

    #[test]
    fn test_block_inline() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);

        block(&mut ctx, |c| c.write("short"), true);

        assert_eq!(ctx.to_string(), "short");
        assert!(!ctx.multiline);
    }

    #[test]
    fn test_block_multiline() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);

        block(
            &mut ctx,
            |c| {
                c.write("line1");
                c.newline();
                c.write("line2");
            },
            true,
        );

        assert_eq!(ctx.to_string(), "\n  line1\n  line2\n");
        assert!(ctx.multiline);
    }

    #[test]
    fn test_block_no_inline() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);

        block(&mut ctx, |c| c.write("content"), false);

        assert_eq!(ctx.to_string(), "\n  content\n");
        assert!(ctx.multiline);
    }

    #[test]
    fn test_block_empty() {
        let allocator = Allocator::default();
        let mut ctx = Context::new(&allocator);

        block(&mut ctx, |_c| {}, true);

        assert_eq!(ctx.to_string(), "");
        assert!(!ctx.multiline);
    }
}
