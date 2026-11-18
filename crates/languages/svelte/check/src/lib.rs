//! Svelte type checking through a source-mapped TypeScript projection.

mod configuration;
mod extension;
pub use configuration::{Configuration, TypeCheckConfiguration};
pub use extension::EXTENSION;
mod registration;
pub use registration::{PLUGIN, register};
