//! Vue compilation tasks.

mod hashing;
mod task;
pub use task::*;

pub mod compile;

pub use task::PLUGIN;

/// Takes no options.
pub static EXTENSION: rsvelte_plugin_interface::Extension = rsvelte_plugin_interface::Extension {
    identifier: "vue.compile",
    install: |registry, _| {
        register(registry);
        Ok(())
    },
};
