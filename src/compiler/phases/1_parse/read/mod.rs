//! Reading specific constructs (script, style, options, expressions).
//!
//! These modules extend Parser with methods for parsing script, style, and svelte:options tags.
//! The expression module provides JavaScript/TypeScript expression parsing using OXC.
//! The style module also provides CSS parsing functionality.
//! The context module provides pattern parsing for {#each} and {#snippet} blocks.

pub mod context;
pub mod expression;
mod options;
mod script;
pub mod style;
