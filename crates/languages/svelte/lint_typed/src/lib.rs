//! Svelte lint rules that require type information.

pub mod computation;
mod configuration;
pub mod lint;
mod rules;
mod task;
pub mod types;

pub use configuration::Configuration;
pub use lint::lint;
pub use task::{Lint, PLUGIN, register, register_with_configuration, register_with_type_provider};
