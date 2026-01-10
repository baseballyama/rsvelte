//! Server-side code generation.
//!
//! Generates JavaScript code for server-side rendering (SSR).
//!
//! This module is organized to match the Svelte compiler structure:
//! - `transform_server.rs` - Main transformation entry point
//! - `visitors/` - Individual visitors for each AST node type
//! - `types.rs` - Server-specific types

mod transform_server;
pub mod types;
pub mod visitors;

pub use transform_server::transform_server;
