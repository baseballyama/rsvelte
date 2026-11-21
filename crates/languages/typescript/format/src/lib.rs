//! TypeScript format.

pub mod options;
pub use options::Options;

mod task;
pub use task::register;
use task::register_with_options;

/// Takes [`Options`], under Prettier's names.
pub static EXTENSION: rsvelte_plugin_interface::Extension = rsvelte_plugin_interface::Extension {
    identifier: "typescript.format",
    install: |registry, settings| {
        let options = settings
            .options::<Options>(EXTENSION.identifier)?
            .map(|o| o.value)
            .unwrap_or_default();
        // Checked once for the run, not on every document.
        if let Err(name) = options.formatter() {
            return Err(rsvelte_plugin_interface::CallError(format!(
                "{}: the formatter does not print this `{name}` value yet",
                EXTENSION.identifier
            )));
        }
        register_with_options(registry, &options);
        Ok(())
    },
};
