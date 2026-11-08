//! CSS trees and their parser.
//!
//! Positions are absolute offsets into the document that embeds the style sheet, so an embedding
//! language never translates coordinates.

pub use parser::{ParseError, parse};
pub use syntax_tree::StyleSheet;

pub(crate) mod parser;
pub mod syntax_tree;
