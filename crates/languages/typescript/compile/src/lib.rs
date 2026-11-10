//! TypeScript compilation: erase the types of an oxc tree and print it as JavaScript.

mod task;
pub use task::*;

pub mod features;
pub mod print;
pub mod strip;

/// Takes no options.
pub static EXTENSION: rsvelte_plugin_interface::Extension = rsvelte_plugin_interface::Extension {
    identifier: "typescript.compile",
    install: |registry, _| {
        register(registry);
        Ok(())
    },
};
