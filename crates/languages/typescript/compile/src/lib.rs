//! TypeScript compilation tasks.

mod task;
pub use task::*;

pub mod codegen;

pub use task::PLUGIN;

/// Takes no options.
pub static EXTENSION: rsvelte_plugin_interface::Extension = rsvelte_plugin_interface::Extension {
    identifier: "typescript.compile",
    install: |registry, _| {
        register(registry);
        Ok(())
    },
};
