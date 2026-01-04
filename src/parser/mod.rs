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

mod expression;
mod lexer;
mod state;

use crate::ast::Root;
use crate::error::ParseResult;

pub use state::Parser;

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
