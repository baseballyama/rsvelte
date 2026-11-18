//! TypeScript format.

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
