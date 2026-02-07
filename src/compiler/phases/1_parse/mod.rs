//! Svelte template parser.
//!
//! This module implements the Svelte parser, which converts Svelte source code
//! into an Abstract Syntax Tree (AST).
//!
//! # Design Goals
//!
//! - **High performance**: Zero-copy parsing where possible, efficient memory layout
//! - **Thread safety**: Parser state is isolated, enabling parallel parsing of multiple files
//! - **Compatibility**: Output matches the official Svelte compiler's AST format
//!
//! # Directory Structure
//!
//! The directory structure mirrors the official Svelte compiler
//! (`svelte/packages/svelte/src/compiler/phases/1-parse/`):
//!
//! ```text
//! 1_parse/
//! ├── mod.rs              # Public API: parse(), ParseOptions
//! ├── parser.rs           # Parser struct + helper methods
//! ├── estree_compat/      # ESTree compatibility layer (test-only)
//! │   ├── mod.rs          # Public API: convert_to_estree()
//! │   ├── expression.rs   # Expression node conversion
//! │   ├── statement.rs    # Statement node conversion
//! │   ├── pattern.rs      # Pattern node conversion
//! │   ├── typescript.rs   # TypeScript annotation conversion
//! │   └── utils.rs        # Position calculation utilities
//! ├── read/               # Reading specific constructs
//! │   ├── mod.rs
//! │   ├── context.rs      # Pattern parsing for {#each} and {#snippet}
//! │   ├── expression.rs   # Expression parsing (uses OXC)
//! │   ├── options.rs      # parse_svelte_options()
//! │   ├── script.rs       # parse_script_tag()
//! │   └── style.rs        # parse_style_tag() + CSS parsing
//! ├── state/              # Parser state machines
//! │   ├── mod.rs
//! │   ├── element.rs      # Element parsing, attributes, directives
//! │   ├── fragment.rs     # parse_fragment(), parse_node() dispatcher
//! │   ├── tag.rs          # Mustache tags, blocks (if/each/await/key/snippet)
//! │   └── text.rs         # Text node parsing
//! └── utils/              # Utility functions
//!     ├── mod.rs
//!     ├── bracket.rs      # Bracket matching utilities
//!     ├── create.rs       # Factory functions for AST nodes
//!     ├── entities.rs     # HTML entity decoding
//!     ├── entities_data.rs # Named entity data (auto-generated)
//!     ├── fuzzymatch.rs   # Fuzzy string matching for error messages
//!     └── html.rs         # is_void_element(), etc.
//! ```
//!
//! Note: Legacy AST conversion is in `compiler/legacy.rs` (matches Svelte's
//! `svelte/packages/svelte/src/compiler/legacy.js`).

#[allow(dead_code)]
pub mod estree_compat;
mod parser;
mod read;
#[allow(dead_code)]
pub mod remove_typescript_nodes;
mod state;
pub(crate) mod utils;

// Re-export CSS parsing for external use
pub use read::style::parse_css;

// Re-export expression from read module
pub(crate) use read::expression;

use crate::ast::Root;
use crate::error::ParseResult;

pub use parser::Parser;

/// Parse options.
#[derive(Debug, Clone, Default)]
pub struct ParseOptions {
    /// Use the modern AST format.
    pub modern: bool,
    /// Continue parsing on errors (loose mode).
    pub loose: bool,
    /// Optional filename for error messages.
    pub filename: Option<String>,
}

/// Parse a Svelte component source into an AST.
pub fn parse(source: &str, options: ParseOptions) -> ParseResult<Root> {
    let mut parser = Parser::new(source, options);
    parser.parse()
}

/// Parse multiple Svelte components in parallel.
///
/// Uses rayon to parse files concurrently for maximum performance.
#[cfg(feature = "native")]
pub fn parse_parallel<'a>(
    sources: impl IntoIterator<Item = (&'a str, &'a str)> + Send,
    options: ParseOptions,
) -> Vec<(&'a str, ParseResult<Root>)>
where
    ParseOptions: Clone + Send + Sync,
{
    use rayon::prelude::*;

    sources
        .into_iter()
        .collect::<Vec<_>>()
        .into_par_iter()
        .map(|(filename, source)| {
            let mut opts = options.clone();
            opts.filename = Some(filename.to_string());
            (filename, parse(source, opts))
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ast::template::TemplateNode;

    #[test]
    fn test_parse_text() {
        let mut parser = Parser::new("hello world", ParseOptions::default());
        let result = parser.parse().unwrap();

        assert_eq!(result.fragment.nodes.len(), 1);
        match &result.fragment.nodes[0] {
            TemplateNode::Text(text) => {
                assert_eq!(text.data.as_str(), "hello world");
                assert_eq!(text.raw.as_str(), "hello world");
            }
            _ => panic!("Expected Text node"),
        }
    }

    #[test]
    fn test_parse_empty() {
        let mut parser = Parser::new("", ParseOptions::default());
        let result = parser.parse().unwrap();

        assert!(result.fragment.nodes.is_empty());
    }

    #[test]
    fn test_parse_element() {
        let mut parser = Parser::new("<div>hello</div>", ParseOptions::default());
        let result = parser.parse().unwrap();

        assert_eq!(result.fragment.nodes.len(), 1);
        match &result.fragment.nodes[0] {
            TemplateNode::RegularElement(el) => {
                assert_eq!(el.name.as_str(), "div");
                assert_eq!(el.fragment.nodes.len(), 1);
            }
            _ => panic!("Expected RegularElement node"),
        }
    }

    #[test]
    fn test_parse_if_block() {
        let mut parser = Parser::new("{#if foo}bar{/if}", ParseOptions::default());
        let result = parser.parse().unwrap();

        assert_eq!(result.fragment.nodes.len(), 1);
        match &result.fragment.nodes[0] {
            TemplateNode::IfBlock(block) => {
                assert!(!block.elseif);
                assert_eq!(block.consequent.nodes.len(), 1);
            }
            _ => panic!("Expected IfBlock node"),
        }
    }

    #[test]
    fn test_parse_class_directive_quoted_expression() {
        // class:selected="{selected === thing}" should parse without error
        let source = r#"{#each things as thing}
	<div class:selected="{selected === thing}"></div>
{/each}"#;
        let mut parser = Parser::new(source, ParseOptions::default());
        let result = parser.parse();
        assert!(
            result.is_ok(),
            "Failed to parse class directive with quoted expression: {:?}",
            result.err()
        );
    }

    #[test]
    fn test_parse_animate_directive_quoted_expression() {
        // animate:flip="{{delay: i * 10}}" should parse without error
        let source = r#"{#each things as thing, i (thing.id)}
	<div animate:flip="{{delay: i * 10}}">{thing.name}</div>
{/each}"#;
        let mut parser = Parser::new(source, ParseOptions::default());
        let result = parser.parse();
        assert!(
            result.is_ok(),
            "Failed to parse animate directive with quoted expression: {:?}",
            result.err()
        );
    }

    #[test]
    fn test_parse_let_directive_quoted_expression() {
        // let:thing="{{ num }}" should parse without error
        let source = r#"<Nested {things} let:thing="{{ num }}">
	<span>{num}</span>
</Nested>"#;
        let mut parser = Parser::new(source, ParseOptions::default());
        let result = parser.parse();
        assert!(
            result.is_ok(),
            "Failed to parse let directive with quoted expression: {:?}",
            result.err()
        );
    }

    #[test]
    fn test_parse_component_no_implicit_close_in_p() {
        // <H1 /> inside <p> should NOT trigger implicit close (H1 is a component, not h1)
        let source = r#"<p>
	<H1 />
</p>"#;
        let mut parser = Parser::new(source, ParseOptions::default());
        let result = parser.parse();
        assert!(
            result.is_ok(),
            "Failed to parse component inside <p>: {:?}",
            result.err()
        );
    }

    #[test]
    fn test_parse_svelte_fragment_let_directive_quoted() {
        // <svelte:fragment let:thing="{{ num }}"> should parse without error
        let source = r#"<Nested {things}>
	<svelte:fragment slot="item" let:thing="{{ num }}">
		<span>{num}</span>
	</svelte:fragment>
</Nested>"#;
        let mut parser = Parser::new(source, ParseOptions::default());
        let result = parser.parse();
        assert!(
            result.is_ok(),
            "Failed to parse svelte:fragment with quoted let directive: {:?}",
            result.err()
        );
    }
}
