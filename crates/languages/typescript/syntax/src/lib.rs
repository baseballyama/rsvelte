//! JavaScript and TypeScript trees and their parser, shared by standalone files and component
//! scripts.
//!
//! One [`syntax_tree::SyntaxTree`] holds every JS node of a document: a component's `<script>` and
//! all of its template expressions share the same columns, so there is one allocation pattern per
//! document, not one per expression.

pub use syntax_tree::{Kind, NodeIdentifier, SyntaxTree};

pub mod lexer;
pub mod operators;
pub mod parser;
pub mod syntax_tree;

pub mod computation;
pub use computation::{PLUGIN, Parsed, Program, is_typescript, matches, register};
