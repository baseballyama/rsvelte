//! TypeScript lint.

pub mod lint;
pub use lint::*;

mod task;
pub use task::{Lint, PLUGIN, register};

/// Takes no options.
pub static EXTENSION: rsvelte_config::Extension = rsvelte_config::Extension {
    identifier: "typescript.lint",
    install: |registry, _| {
        register(registry);
        Ok(())
    },
};
