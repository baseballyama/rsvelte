//! TypeScript lint.

pub(crate) mod lint;
pub use lint::*;

mod task;
use rsvelte_lint_runner::configuration::RuleLevels;
use rsvelte_plugin_interface::{CallError, Extension};
use serde::Deserialize;
pub use task::{Lint, PLUGIN, register};

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
struct Options {
    rules: Option<RuleLevels>,
}

/// Reads `rules`, `ESLint` levels by rule name; its rules take no options.
pub static EXTENSION: Extension = Extension {
    identifier: "typescript.lint",
    install: |registry, settings| {
        let rules = settings
            .options::<Options>("typescript.lint")?
            .and_then(|options| options.value.rules);
        let rules =
            task::configure(rules).map_err(|e| CallError(format!("typescript.lint: {e}")))?;
        task::register_with(registry, rules);
        Ok(())
    },
};
