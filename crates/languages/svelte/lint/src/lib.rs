//! Svelte lint.

pub mod lint;
pub use lint::lint;

pub mod computation;
mod configuration;
mod directives;
pub use configuration::{Configuration, ConfiguredRule, definition};
mod extension;
pub use extension::EXTENSION;
pub mod external;
pub mod rule;
mod rules;
mod settings;
pub use settings::{Kit, KitFiles, LintSettings, SvelteConfig};
mod task;
pub use task::{Lint, PLUGIN, register, register_artifacts, register_with_configuration};
