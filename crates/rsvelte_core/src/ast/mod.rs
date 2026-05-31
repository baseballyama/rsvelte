//! Svelte AST definitions.
//!
//! This module contains the Abstract Syntax Tree types for Svelte components.
//! The types are designed for:
//! - Memory efficiency (fields ordered by size, compact representations)
//! - Cache-friendly layouts
//! - Easy serialization to match Svelte's JSON output

pub mod arena;
pub mod css;
pub mod js;
pub mod span;
pub mod template;
pub mod typed_expr;

pub use span::{LineColumn, SourceLocation, Span, Spanned};
pub use template::*;
