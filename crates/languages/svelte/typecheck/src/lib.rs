//! Svelte type checking through a source-mapped TypeScript projection.

mod configuration;
pub use configuration::{Configuration, TypeCheckConfiguration};
mod registration;
pub use registration::{PLUGIN, register};
