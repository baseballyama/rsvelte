//! Svelte lint.

mod lint;
pub use lint::lint;

mod computation;
mod configuration;
pub use configuration::{Configuration, ConfiguredRule, Directives, definition};
mod extension;
pub use extension::EXTENSION;
mod host_rule;
mod pattern;
pub mod project;
pub mod rule;
mod rules;
pub use rules::{RUNE_GLOBALS, reporting as reporting_rules};
mod settings;
pub mod svelte_config;
pub use settings::{
    CompileOptions, ExperimentalAsync, Kit, KitFiles, LintSettings, Postcss, SvelteConfig, Warning,
    WarningHandler,
};
mod task;
mod words;
pub use task::{
    Lint, PLUGIN, register, register_artifacts, register_type_provider, register_with_configuration,
};
pub mod types;
