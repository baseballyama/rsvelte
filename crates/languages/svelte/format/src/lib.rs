//! Svelte format.

pub(crate) mod format;

pub mod options;
pub use options::Options;

mod task;
pub use task::{Format, PLUGIN, format, register, register_with_options};

/// Takes [`Options`], under Prettier's names.
pub static EXTENSION: rsvelte_plugin_interface::Extension = rsvelte_plugin_interface::Extension {
    identifier: "svelte.format",
    install: |registry, settings| {
        let options = settings
            .options::<Options>(EXTENSION.identifier)?
            .map(|o| o.value)
            .unwrap_or_default();
        // Said once for the run, not on every document, and only to a run that formats.
        if settings.runs(
            Format::IDENTIFIER,
            rsvelte_plugin_interface::TaskKind::Document,
        ) && let Some(name) = format::unported(&options)
        {
            return Err(rsvelte_plugin_interface::CallError(format!(
                "{}: the formatter does not print this `{name}` value yet",
                EXTENSION.identifier
            )));
        }
        register_with_options(registry, options);
        Ok(())
    },
};
