//! Vue compilation tasks.

mod hashing;
mod task;
pub use task::*;

pub(crate) mod compile;

/// Takes no options.
pub static EXTENSION: rsvelte_plugin_interface::Extension = rsvelte_plugin_interface::Extension {
    identifier: "vue.compile",
    install: |registry, _| {
        register(registry);
        Ok(())
    },
};
