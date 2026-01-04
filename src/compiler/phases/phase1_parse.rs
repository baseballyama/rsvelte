//! Phase 1: Parse
//!
//! Convert Svelte source code into an Abstract Syntax Tree (AST).
//!
//! This phase is responsible for:
//! - Parsing the HTML-like template syntax
//! - Extracting script blocks (instance and module)
//! - Parsing style blocks
//! - Reading svelte:options directives
//!
//! The parser produces a `Root` AST node that contains all the parsed information.

use crate::error::ParseError;
use crate::parser;

/// Re-export the AST types
pub use crate::ast::template::Root;

/// Re-export ParseOptions
pub use crate::parser::ParseOptions;

/// Parse Svelte source code into an AST.
///
/// This is the entry point for Phase 1 of the compiler.
///
/// # Arguments
///
/// * `source` - The Svelte component source code
/// * `options` - Parse options
///
/// # Returns
///
/// Returns a `Root` AST node on success, or a `ParseError` on failure.
pub fn parse(source: &str, options: ParseOptions) -> Result<Root, ParseError> {
    parser::parse(source, options)
}
