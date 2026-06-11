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

pub mod estree_compat;
mod parser;
pub(crate) mod read;
pub mod remove_typescript_nodes;
pub(crate) mod resolve_lazy;
mod state;
pub(crate) mod utils;

// Re-export CSS parsing for external use
pub use read::style::parse_css;
// Re-export deferred-work entry points so profiling/diagnostic tools can
// invoke them outside the analyze_component pipeline.
#[doc(hidden)]
pub use read::script::ensure_script_parsed;
#[doc(hidden)]
pub use resolve_lazy::resolve_lazy_expressions;

// Re-export expression from read module
pub(crate) use read::expression;

use crate::ast::Root;
use crate::error::ParseResult;

pub use parser::Parser;

/// Parse options.
#[derive(Debug, Clone, Copy, Default)]
pub struct ParseOptions {
    /// Use the modern AST format.
    pub modern: bool,
    /// Continue parsing on errors (loose mode).
    pub loose: bool,
    /// Skip creating loc objects in Expression JSON values.
    /// When true, loc fields are set to null instead of creating nested objects.
    /// This saves significant allocations during compilation where loc is never used.
    pub skip_expression_loc: bool,
    /// Defer script content parsing for faster parse().
    /// When true, script blocks store raw content and parse lazily in the analysis phase.
    /// Set to false for tests that compare parse output directly.
    pub defer_script_parse: bool,
}

/// Extended parse options with filename (separate to keep ParseOptions Copy).
#[derive(Debug, Clone, Default)]
pub struct ParseOptionsWithFilename {
    pub options: ParseOptions,
    pub filename: Option<String>,
}

/// Parse a Svelte component source into an AST.
pub fn parse(source: &str, options: ParseOptions) -> ParseResult<Root> {
    let mut parser = Parser::new(source, options);
    // RAII install so to_value() calls during parsing
    // (e.g. build_const_variable_declaration) can resolve JsNodeIds.
    // The guard restores any outer pointer on drop / panic — important
    // when this parse() is invoked from within a `compile()` that has
    // already installed its own arena.
    //
    // SAFETY: `parser.arena` lives until `parser` is dropped, which
    // happens after `_guard`.
    let _guard = unsafe { crate::ast::arena::SerializeArenaGuard::new(&parser.arena as *const _) };
    parser.parse()
}

/// Parse with a reusable parser instance for reduced per-file overhead.
/// The parser is reset between calls, reusing internal allocations.
pub fn parse_reuse<'a>(
    parser: &mut Parser<'a>,
    source: &'a str,
    options: ParseOptions,
) -> ParseResult<Root> {
    parser.reset(source, options);
    // SAFETY: `parser.arena` lives until the caller drops `parser`,
    // which can only happen after this function returns.
    let _guard = unsafe { crate::ast::arena::SerializeArenaGuard::new(&parser.arena as *const _) };
    parser.parse()
}

/// Compute line offsets for a source string (used for deferred script parsing).
pub fn compute_line_offsets(source: &str, skip: bool) -> Vec<usize> {
    if skip {
        return Vec::new();
    }
    let bytes = source.as_bytes();
    let mut offsets = Vec::with_capacity(bytes.len() / 40 + 1);
    offsets.push(0);
    let mut pos = 0;
    while let Some(offset) = memchr::memchr(b'\n', &bytes[pos..]) {
        let abs = pos + offset;
        offsets.push(abs + 1);
        pos = abs + 1;
    }
    offsets
}

/// Parse a standalone JavaScript / TypeScript module source into an
/// ESTree-compatible JSON program (offsets are byte positions in `source`).
///
/// Unlike [`parse`], which expects a Svelte component, this parses a whole file
/// as a JS/TS module — used to lint `*.svelte.js` / `*.svelte.ts` / `*.js`
/// module files. The program node and its children are materialised eagerly
/// (resolved through a fresh arena), so the returned value is self-contained.
pub fn parse_module_to_estree(source: &str, is_typescript: bool) -> serde_json::Value {
    let arena = crate::ast::arena::ParseArena::new();
    let line_offsets = compute_line_offsets(source, false);
    // The serialize arena must be installed for the WHOLE conversion: when the
    // source contains comments, `parse_program` resolves statement children via
    // `to_value()` during the parse itself (not just the final `as_json`), so
    // without the guard active those arena-indexed children (e.g. an import's
    // `source` / `specifiers`) come back empty.
    crate::ast::arena::with_serialize_arena(&arena, || {
        let (program, _parse_error) = expression::parse_program_with_error(
            &arena,
            source,
            0,
            &line_offsets,
            is_typescript,
            &[],
            0,
            source.len(),
        );
        program.as_json().clone()
    })
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
            let opts = options;
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

    #[test]
    fn test_parse_multibyte_style_directive() {
        // Regression test: style directives with quoted values after multibyte characters
        // Bug: chars().nth() was used with byte index, causing wrong quote detection
        let source = "<script lang=\"ts\">\n  interface Props {\n    /** あ */\n    content: string;\n  }\n  const { content }: Props = $props();\n</script>\n\n<div style:width=\"100%\">{content}</div>";

        assert_ne!(
            source.len(),
            source.chars().count(),
            "Source should contain multibyte chars"
        );
        let result = parse(source, ParseOptions::default());
        assert!(
            result.is_ok(),
            "style:width with multibyte chars should parse: {:?}",
            result.err()
        );
    }

    #[test]
    fn test_parse_multibyte_complex_template() {
        // Regression test: complex template with style directives, if blocks, and multibyte chars
        let source = concat!(
            "<script lang=\"ts\">\n",
            "  interface Props {\n",
            "    /** アバター */\n",
            "    content: 'image' | 'initial';\n",
            "    size?: string;\n",
            "  }\n",
            "  const { content, size = 's' }: Props = $props();\n",
            "  const px = $derived.by(() => size === 'xs' ? 20 : 32);\n",
            "</script>\n\n",
            "<div class=\"avatar\" style:width={`${px}px`} style:height={`${px}px`}>\n",
            "  {#if content === 'image'}\n",
            "    <span>img</span>\n",
            "  {:else}\n",
            "    <div style:width=\"100%\" style:height=\"100%\">init</div>\n",
            "  {/if}\n",
            "</div>\n",
        );

        assert_ne!(source.len(), source.chars().count());
        let result = parse(source, ParseOptions::default());
        assert!(
            result.is_ok(),
            "Complex template with multibyte should parse: {:?}",
            result.err()
        );
    }

    #[test]
    fn test_parse_html_comment_in_attributes() {
        // `//` inside HTML attributes should be treated as an attribute, not cause parse errors
        let source = r#"<ul
    role="presentation"
    // comment
    class="list"
>
    hello
</ul>"#;
        let result = parse(source, ParseOptions::default());
        assert!(
            result.is_ok(),
            "Should parse // in HTML attributes: {:?}",
            result.err()
        );
    }
}
