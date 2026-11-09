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
mod pattern;
pub use pattern::Pattern;
pub mod rule;
mod rules;
mod settings;
pub use settings::{Kit, KitFiles, LintSettings, SvelteConfig, Warning, WarningHandler};
mod task;
mod words;
pub use task::{
    Lint, PLUGIN, register, register_artifacts, register_type_provider, register_with_configuration,
};
pub mod types;
