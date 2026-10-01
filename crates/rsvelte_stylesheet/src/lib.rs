//! CSS as a language library: a tree for style sheets, selector matching against any element
//! model ([`matcher::Element`]), scoping (`.svelte-xyz` insertion) and a formatter.
//!
//! Positions are absolute offsets into the document that embeds the style sheet, so an embedding
//! language never translates coordinates.

pub mod format;
pub mod matcher;
pub mod parser;
pub mod scope;
pub mod syntax_tree;

pub use parser::parse;
pub use syntax_tree::StyleSheet;
