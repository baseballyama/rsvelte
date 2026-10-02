//! CSS as a language library: a tree for style sheets, selector matching against any element
//! model ([`matcher::Element`]), scoping (`.svelte-xyz` insertion) and a formatter.
//!
//! Positions are absolute offsets into the document that embeds the style sheet, so an embedding
//! language never translates coordinates.

pub use parser::parse;
pub use syntax_tree::StyleSheet;

pub mod syntax;
pub use syntax::{parser, syntax_tree};

pub mod semantic;
pub use semantic::matcher;

pub mod compilation;
pub use compilation::scope;
