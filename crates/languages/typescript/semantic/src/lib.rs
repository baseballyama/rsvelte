//! Scopes and constant folding over JavaScript and TypeScript trees.

pub mod globals;
pub mod number;
pub mod reference_tracker;
pub mod semantic;
pub mod static_value;

pub(crate) mod computation;
pub use computation::{PLUGIN, Resolved, register};
