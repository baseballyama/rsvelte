//! TypeScript format.

pub mod options;
pub use options::Options;

mod task;
pub use task::{Format, PLUGIN, register, register_with_options};

/// Takes [`Options`], under Prettier's names.
pub static EXTENSION: rsvelte_plugin_interface::Extension = rsvelte_plugin_interface::Extension {
    identifier: "typescript.format",
    install: |registry, settings| {
        let (options, base) = settings
            .options::<Options>(EXTENSION.identifier)?
            .map_or_else(Default::default, |o| (o.value, o.base));
        // Checked once for the run, not on every document.
        if let Err(name) = options.formatter() {
            return Err(rsvelte_plugin_interface::CallError(format!(
                "{}: the formatter does not print this `{name}` value yet",
                EXTENSION.identifier
            )));
        }
        let formats = settings.runs(
            Format::IDENTIFIER,
            rsvelte_plugin_interface::TaskKind::Document,
        );
        let tailwind = match &options.sort_tailwindcss {
            Some(tailwind) if formats => Some(
                rsvelte_stylesheet_format::tailwind::Sorter::start(tailwind, &base).map_err(
                    |error| {
                        rsvelte_plugin_interface::CallError(format!(
                            "{}: {error}",
                            EXTENSION.identifier
                        ))
                    },
                )?,
            ),
            _ => None,
        };
        register_with_options(registry, &options, tailwind);
        Ok(())
    },
};
