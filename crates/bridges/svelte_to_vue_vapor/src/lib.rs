//! Svelte 5 components compiled for the Vue Vapor runtime. Targets, coverage and tests are in the
//! crate's `README.md` and `COVERAGE.md`.

pub(crate) mod compilation;
pub(crate) mod computation;
pub use computation::register;

/// Takes no options.
pub static EXTENSION: rsvelte_plugin_interface::Extension = rsvelte_plugin_interface::Extension {
    identifier: "vuelte",
    install: |registry, _| {
        register(registry);
        Ok(())
    },
};
