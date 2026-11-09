//! CSS as a language library: a tree for style sheets, selector matching against any element
//! model ([`matcher::Element`]), scoping (`.svelte-xyz` insertion) and a formatter.
//!
//! Positions are absolute offsets into the document that embeds the style sheet, so an embedding
//! language never translates coordinates.

pub use parser::parse;
pub use syntax_tree::StyleSheet;

pub mod syntax {
    pub mod parser;
    pub mod postcss;
    pub mod syntax_tree;
}
pub use syntax::{parser, postcss, syntax_tree};

pub mod properties;

pub mod semantic {
    pub mod matcher;
}
pub use semantic::matcher;

pub mod compilation {
    pub mod scope;
}
pub use compilation::scope;
