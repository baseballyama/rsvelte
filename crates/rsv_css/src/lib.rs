//! CSS as a language library: a tree for style sheets, selector matching against any element
//! model ([`matcher::Element`]), scoping (`.svelte-xyz` insertion) and a formatter.
//!
//! Positions are absolute offsets into the document that embeds the style sheet, so an embedding
//! language never translates coordinates.

pub mod ast;
pub mod format;
pub mod matcher;
pub mod parser;
pub mod scope;

pub use ast::StyleSheet;
pub use parser::parse;
