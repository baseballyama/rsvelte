//! Vue format.

pub mod format;
pub use format::*;

mod task;
pub use task::{Format, PLUGIN, register};

/// Takes no options.
pub static EXTENSION: rsvelte_config::Extension = rsvelte_config::Extension {
    identifier: "vue.format",
    install: |registry, _| {
        register(registry);
        Ok(())
    },
};
