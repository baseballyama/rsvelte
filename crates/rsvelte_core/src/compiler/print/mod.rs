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
//! use rsvelte_core::compiler::print::print;
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
pub use helpers::{
    LINE_BREAK_THRESHOLD, SUPPORTED_ESTREE_NODE_TYPES, block, try_estree_to_string,
    with_unsupported_sink,
};

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
    print_with_source(ast, _options, None)
}

/// Print AST with external source text (avoids storing source in Root).
pub fn print_with_source(
    ast: &Root,
    _options: Option<PrintOptions>,
    source: Option<&str>,
) -> Result<PrintResult, PrintError> {
    // Set the serialize arena so that as_json() calls can resolve JsNodeIds
    crate::ast::arena::with_serialize_arena(&ast.arena, || {
        let (code, unsupported) = helpers::with_unsupported_sink(|| {
            let allocator = Allocator::default();
            let mut context = Context::new_with_source(&allocator, source);

            // Visit the root node to generate the code
            visitors::visit_root(&mut context, ast);

            context.to_string()
        });

        // The ESTree fallback printer substitutes a comment for anything it
        // cannot represent, so a success here would ship silently erased code.
        if !unsupported.is_empty() {
            return Err(helpers::unsupported_nodes_error(&unsupported));
        }

        Ok(PrintResult {
            code,
            // Source map generation for this API isn't implemented yet.
            map: None,
        })
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
        let ast =
            crate::parse(source, &oxc_allocator::Allocator::default(), parse_options).unwrap();
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
        let ast =
            crate::parse(source, &oxc_allocator::Allocator::default(), parse_options).unwrap();
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
        let ast =
            crate::parse(source, &oxc_allocator::Allocator::default(), parse_options).unwrap();
        let result = print(&ast, None).unwrap();
        assert!(result.code.contains("<input"));
        assert!(result.code.contains("type"));
        assert!(result.code.contains("/>"));
    }

    fn parse_for_print(source: &str) -> crate::ast::Root<'_> {
        let parse_options = ParseOptions {
            modern: true,
            ..Default::default()
        };
        crate::parse(source, &oxc_allocator::Allocator::default(), parse_options).unwrap()
    }

    #[test]
    fn print_without_source_keeps_statement_bodies() {
        // A function body used to print as the literal `{ /* block */ }`, and a
        // `$:` statement as `/* unknown */`. Both came back as a successful
        // print. Measured over the pinned Svelte submodule's 4,468 `.svelte`
        // files, the placeholder reached 528 of them.
        let source = "<script>\n\tlet count = 0;\n\t$: doubled = count * 2;\n\tconst f = () => {\n\t\tcount += 1;\n\t\treturn count;\n\t};\n</script>";
        let ast = parse_for_print(source);

        let printed = print(&ast, None).expect("representable statements must print");
        assert!(
            printed.code.contains("$: doubled = count * 2;"),
            "{}",
            printed.code
        );
        assert!(
            printed.code.contains("count += 1; return count;"),
            "{}",
            printed.code
        );
        assert!(!printed.code.contains("/* block */"), "{}", printed.code);
        assert!(!printed.code.contains("/* unknown */"), "{}", printed.code);

        // The path production uses is unaffected: it prints from the source.
        let ok = print_with_source(&ast, None, Some(source)).expect("source path is unaffected");
        assert!(ok.code.contains("$: doubled = count * 2;"), "{}", ok.code);
    }

    #[test]
    fn print_without_source_reparses() {
        // The exact-text tests cannot see whether the fallback's output is
        // JavaScript at all. Re-parsing is what caught the missing parentheses:
        // with the bodies printed, `b ?? (b = 1)` came out as `b ?? b = 1`.
        for source in [
            "<script>\n\tlet b;\n\tfunction f() { b ?? (b = 1); }\n</script>",
            "<script>\n\tconst o = { get a() { return 1; }, set a(v) {}, m() {} };\n</script>",
            "<script>\n\tlet a, b;\n\tfunction f() { ({ a, b } = { a: 1, b: 2 }); }\n</script>",
            // An arrow's expression body opening with `{` reads as a block body.
            "<button onclick={() => ({ a } = { a: 1 })}>x</button>",
            "<script>\n\tconst x = (1 + 2) * 3;\n\tconst y = 2 ** 3 ** 4;\n\tconst z = (a, b);\n</script>",
            // `??` may not sit next to `||` unparenthesized, whatever the
            // precedence comparison says.
            "<script>\n\tconst x = (a || b) ?? c;\n\tconst y = a ?? (b && c);\n</script>",
            "<script>\n\tfunction f() { for (const k in o) { try { g(); } catch (e) {} } }\n</script>",
        ] {
            let ast = parse_for_print(source);
            let printed = print(&ast, None).expect("must print").code;
            let allocator = oxc_allocator::Allocator::default();
            let options = ParseOptions {
                modern: true,
                ..Default::default()
            };
            crate::parse(&printed, &allocator, options)
                .unwrap_or_else(|e| panic!("printed output does not parse: {printed}\n{e:?}"));
        }
    }

    #[test]
    fn print_without_source_rejects_unrepresentable_nodes() {
        // Negative control for the test above. The fallback prints JavaScript,
        // so a TypeScript-only node is still an error rather than a placeholder.
        let source = "<script lang=\"ts\">\n\tconst x = y satisfies Z;\n</script>";
        let ast = parse_for_print(source);

        let err = print(&ast, None).expect_err("an unrepresentable node must not print");
        assert!(err.to_string().contains("TSSatisfiesExpression"), "{err}");
    }

    #[test]
    fn test_print_nested_elements() {
        let source = "<div><p>Nested</p></div>";
        let parse_options = ParseOptions {
            modern: true,
            ..Default::default()
        };
        let ast =
            crate::parse(source, &oxc_allocator::Allocator::default(), parse_options).unwrap();
        let result = print(&ast, None).unwrap();
        assert!(result.code.contains("<div>"));
        assert!(result.code.contains("<p>"));
        assert!(result.code.contains("Nested"));
    }
}
