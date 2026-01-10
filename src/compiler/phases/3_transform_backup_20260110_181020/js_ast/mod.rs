//! JavaScript AST building utilities.
//!
//! This module provides:
//! - AST node types representing JavaScript/ESTree constructs
//! - Builder functions for constructing AST nodes (similar to Svelte's builders.js)
//! - Code generation using oxc

pub mod builders;
pub mod codegen;
pub mod nodes;

pub use builders::*;
pub use codegen::*;
pub use nodes::*;
