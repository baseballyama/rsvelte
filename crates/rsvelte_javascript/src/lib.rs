//! JavaScript (and the TypeScript that Svelte components embed).
//!
//! One [`syntax_tree::SyntaxTree`] holds every JS node of a document: a component's `<script>` and
//! all of its template expressions share the same columns, so there is one allocation pattern per
//! document, not one per expression.

pub mod check;
pub mod codegen;
pub mod copy;
pub mod format;
pub mod lexer;
pub mod lint;
pub mod operators;
pub mod parser;
pub mod scope;
pub mod syntax_tree;

pub use syntax_tree::{Kind, NodeIdentifier, SyntaxTree};
