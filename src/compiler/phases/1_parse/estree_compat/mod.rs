//! Conversion layer to ESTree-compatible format
//!
//! This module converts the Rust compiler's internal AST structures
//! into the ESTree-format JSON that the official Svelte compiler (JavaScript) outputs.
//!
//! ## Purpose
//!
//! - **Test compatibility**: Comparison with the official Svelte compiler test suite
//! - **Legacy compatibility**: Integration with existing tools
//!
//! ## Important notes
//!
//! This module is **not required for core compiler functionality**.
//! The Rust compiler uses its own AST structures to compile Svelte files into JS code.
//! ESTree format conversion is used only for testing purposes.
//!
//! ## Architecture
//!
//! ```
//! OXC AST (Rust structs)
//!     |
//! [estree_compat conversion layer] <-- this module
//!     |
//! ESTree JSON (serde_json::Value)
//!     |
//! Comparison with test fixtures
//! ```

pub mod expression;
pub mod pattern;
pub mod statement;
pub mod typescript;
pub mod utils;

use serde_json::Value;

/// Public API to convert OXC AST to ESTree-compatible JSON format
///
/// # Arguments
///
/// * `ast` - AST obtained from the OXC parser
/// * `source` - Original source code (used for comment processing)
/// * `offset` - Offset in the source code (for partial parsing)
/// * `line_offsets` - Line offset table (for position calculation)
///
/// # Returns
///
/// ESTree-format JSON (serde_json::Value)
///
/// # Examples
///
/// ```ignore
/// use oxc_parser::Parser;
/// use oxc_allocator::Allocator;
///
/// let source = "const x = 1 + 2;";
/// let allocator = Allocator::default();
/// let parser = Parser::new(&allocator, source, SourceType::default());
/// let result = parser.parse();
///
/// let line_offsets = compute_line_offsets(source);
/// let estree_json = convert_expression_to_estree(
///     &result.program.body[0].expression,
///     source,
///     0,
///     &line_offsets
/// );
/// ```
pub fn convert_expression_to_estree(
    expr: &oxc_ast::ast::Expression,
    source: &str,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    expression::convert_expression(expr, source, offset, line_offsets)
}

/// Convert an entire program to ESTree-compatible JSON format
pub fn convert_program_to_estree(
    program: &oxc_ast::ast::Program,
    source: &str,
    line_offsets: &[usize],
) -> Value {
    statement::convert_program(program, source, line_offsets)
}

/// Compute line offset table
///
/// ESTree requires line and column numbers, but OXC only provides byte offsets.
/// This function builds a table for calculating line and column numbers from byte offsets.
pub fn compute_line_offsets(source: &str) -> Vec<usize> {
    utils::compute_line_offsets(source)
}
