//! TypeScript format.

pub(crate) mod format;
pub use format::*;

mod strict;
pub use strict::refuse_strict_errors;

mod task;
pub use task::{Format, PLUGIN, register};

/// Takes no options.
pub static EXTENSION: rsvelte_plugin_interface::Extension = rsvelte_plugin_interface::Extension {
    identifier: "typescript.format",
    install: |registry, _| {
        register(registry);
        Ok(())
    },
};
