//! Reading specific constructs (script, style, options, expressions).
//!
//! These modules extend Parser with methods for parsing script, style, and svelte:options tags.
//! The expression module provides JavaScript/TypeScript expression parsing using OXC.
//! The style module also provides CSS parsing functionality.

pub mod expression;
pub(crate) mod options;
pub(crate) mod script;
pub(crate) mod strict_mode;
pub mod style;
