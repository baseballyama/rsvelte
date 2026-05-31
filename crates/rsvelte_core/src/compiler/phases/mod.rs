//! Svelte compiler phases.
//!
//! The compilation process is divided into three main phases:
//!
//! 1. **Parse** (`1_parse`): Convert source code into an AST
//! 2. **Analyze** (`2_analyze`): Semantic analysis - scopes, bindings, reactivity
//! 3. **Transform** (`3_transform`): Code generation for client/server

#[path = "1_parse/mod.rs"]
pub mod phase1_parse;
#[path = "2_analyze/mod.rs"]
pub mod phase2_analyze;
#[path = "3_transform/mod.rs"]
pub mod phase3_transform;

// Re-exports for convenience
pub use phase1_parse::parse;
pub use phase2_analyze::{ComponentAnalysis, analyze_component};
pub use phase3_transform::{TransformResult, transform_component};
