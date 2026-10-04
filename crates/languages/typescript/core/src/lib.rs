//! JavaScript and TypeScript, shared by standalone files and component scripts.
//!
//! One [`syntax_tree::SyntaxTree`] holds every JS node of a document: a component's `<script>` and
//! all of its template expressions share the same columns, so there is one allocation pattern per
//! document, not one per expression.

pub use syntax_tree::{Kind, NodeIdentifier, SyntaxTree};

pub mod syntax;
pub use syntax::{lexer, operators, parser, syntax_tree};

pub mod semantic;
pub use semantic::scope;

pub mod compilation;
pub use compilation::copy;

pub mod computation;
pub use computation::{Parsed, Program, Resolved, is_typescript, matches, register};

pub use computation::PLUGIN;
