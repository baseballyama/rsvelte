//! Scopes and constant folding over JavaScript and TypeScript trees.

pub mod number;
pub mod scope;

pub mod computation;
pub use computation::{PLUGIN, Resolved, register};
