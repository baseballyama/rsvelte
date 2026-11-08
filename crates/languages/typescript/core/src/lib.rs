//! JavaScript and TypeScript, shared by standalone files and component scripts.
//!
//! One [`syntax_tree::SyntaxTree`] holds every JS node of a document: a component's `<script>` and
//! all of its template expressions share the same columns, so there is one allocation pattern per
//! document, not one per expression.

pub use syntax_tree::{Kind, NodeIdentifier, SyntaxTree};

pub mod syntax {
    pub mod lexer;
    pub mod operators;
    pub mod parser;
    pub mod syntax_tree;
}
pub use syntax::{lexer, operators, parser, syntax_tree};

pub mod semantic {
    pub mod number;
    pub mod scope;
}
pub use semantic::scope;

pub mod compilation {
    pub mod copy;
}
pub use compilation::copy;

pub mod computation;
pub use computation::{PLUGIN, Parsed, Program, Resolved, is_typescript, matches, register};
