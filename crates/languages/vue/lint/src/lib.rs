//! Vue lint.

pub mod lint;
pub use lint::*;

mod task;
pub use task::{Lint, PLUGIN, register};

/// Takes no options.
pub static EXTENSION: rsvelte_plugin_interface::Extension = rsvelte_plugin_interface::Extension {
    identifier: "vue.lint",
    install: |registry, _| {
        register(registry);
        Ok(())
    },
};
