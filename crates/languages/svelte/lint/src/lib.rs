//! Svelte lint.

pub mod lint;
pub use lint::*;

pub mod computation;
mod configuration;
mod extension;
pub use extension::EXTENSION;
mod rules;
pub use configuration::{Configuration, RuleConfiguration};
mod task;
pub use task::{Lint, PLUGIN, register, register_artifacts, register_with_configuration};
