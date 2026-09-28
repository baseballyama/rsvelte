//! JavaScript (and the TypeScript that Svelte components embed).
//!
//! One [`ast::Ast`] holds every JS node of a document: a component's `<script>` and all of its
//! template expressions share the same columns, so there is one allocation pattern per document,
//! not one per expression.

pub mod ast;
pub mod check;
pub mod codegen;
pub mod copy;
pub mod format;
pub mod lexer;
pub mod lint;
pub mod ops;
pub mod parser;
pub mod scope;

pub use ast::{Ast, Kind, NodeId};
