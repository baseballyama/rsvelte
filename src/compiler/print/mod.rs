//! Print module for converting Svelte AST back to source code.
//!
//! This module provides functionality to convert a Svelte AST node back into
//! Svelte source code. It is primarily intended for tools that parse and transform
//! components using the compiler's modern AST representation.
//!
//! The implementation follows the esrap-based printer from the official Svelte compiler:
//! - `svelte/packages/svelte/src/compiler/print/index.js`
//!
//! ## Usage
//!
//! ```rust,ignore
//! use svelte_compiler_rust::compiler::print::print;
//!
//! let ast = parse(source, options)?;
//! let result = print(&ast, None)?;
//! println!("{}", result.code);
//! ```

mod context;
mod css_visitors;
mod helpers;
mod visitors;

pub use context::Context;
pub use helpers::{LINE_BREAK_THRESHOLD, block};

use crate::ast::Root;
use oxc_allocator::Allocator;

/// Options for the print function.
#[derive(Debug, Clone, Default)]
pub struct PrintOptions {
    /// Custom function to get leading comments for a node.
    pub get_leading_comments: Option<fn(&str) -> Vec<String>>,
    /// Custom function to get trailing comments for a node.
    pub get_trailing_comments: Option<fn(&str) -> Vec<String>>,
}

/// Result of printing an AST node.
#[derive(Debug, Clone)]
pub struct PrintResult {
    /// The generated source code.
    pub code: String,
    /// Optional source map.
    pub map: Option<String>,
}

/// Print a Svelte AST node back to source code.
///
/// This function converts a Svelte AST node produced by parse with modern: true,
/// or any sub-node within that modern AST, back into Svelte source code.
///
/// The result contains the generated source and a corresponding source map.
/// The output is valid Svelte, but formatting details such as whitespace or
/// quoting may differ from the original.
///
/// # Arguments
///
/// * `ast` - The AST node to print (Root or any sub-node)
/// * `options` - Optional printing options
///
/// # Returns
///
/// Returns a `PrintResult` containing the generated code and optional source map.
pub fn print(ast: &Root, _options: Option<PrintOptions>) -> Result<PrintResult, PrintError> {
    let allocator = Allocator::default();
    let mut context = Context::new_with_source(&allocator, ast.source.as_deref());

    // Visit the root node to generate the code
    visitors::visit_root(&mut context, ast);

    Ok(PrintResult {
        code: context.to_string(),
        map: context.get_source_map(),
    })
}

/// Error type for print failures.
#[derive(Debug, thiserror::Error)]
pub enum PrintError {
    /// Invalid AST structure
    #[error("Invalid AST structure: {0}")]
    InvalidAst(String),
    /// Unsupported node type
    #[error("Unsupported node type: {0}")]
    UnsupportedNode(String),
}

#[cfg(test)]
mod css_test;

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ParseOptions;

    #[test]
    fn test_print_simple_element() {
        let source = "<h1>Hello World</h1>";
        let parse_options = ParseOptions {
            modern: true,
            ..Default::default()
        };
        let ast = crate::parse(source, parse_options).unwrap();
        let result = print(&ast, None).unwrap();
        assert!(result.code.contains("<h1>"));
        assert!(result.code.contains("Hello World"));
        assert!(result.code.contains("</h1>"));
    }

    #[test]
    fn test_print_with_attributes() {
        let source = r#"<div class="test" id="main">Content</div>"#;
        let parse_options = ParseOptions {
            modern: true,
            ..Default::default()
        };
        let ast = crate::parse(source, parse_options).unwrap();
        let result = print(&ast, None).unwrap();
        assert!(result.code.contains("<div"));
        assert!(result.code.contains("class"));
        assert!(result.code.contains("id"));
        assert!(result.code.contains("Content"));
    }

    #[test]
    fn test_print_self_closing() {
        let source = "<input type=\"text\" />";
        let parse_options = ParseOptions {
            modern: true,
            ..Default::default()
        };
        let ast = crate::parse(source, parse_options).unwrap();
        let result = print(&ast, None).unwrap();
        assert!(result.code.contains("<input"));
        assert!(result.code.contains("type"));
        assert!(result.code.contains("/>"));
    }

    #[test]
    fn test_print_nested_elements() {
        let source = "<div><p>Nested</p></div>";
        let parse_options = ParseOptions {
            modern: true,
            ..Default::default()
        };
        let ast = crate::parse(source, parse_options).unwrap();
        let result = print(&ast, None).unwrap();
        assert!(result.code.contains("<div>"));
        assert!(result.code.contains("<p>"));
        assert!(result.code.contains("Nested"));
    }
}
