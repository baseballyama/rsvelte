//! Svelte lint.

pub mod lint;
pub use lint::*;

pub mod computation;
mod configuration;
mod rules;
pub use configuration::{Configuration, RuleConfiguration};
mod task;
pub use task::{Lint, register, register_artifacts, register_with_configuration};

pub use task::PLUGIN;
