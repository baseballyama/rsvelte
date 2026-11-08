//! Vue compilation tasks.

mod task;
pub use task::*;

pub mod compile;

pub use task::PLUGIN;

/// Takes no options.
pub static EXTENSION: rsvelte_config::Extension = rsvelte_config::Extension {
    identifier: "vue.compile",
    install: |registry, _| {
        register(registry);
        Ok(())
    },
};
