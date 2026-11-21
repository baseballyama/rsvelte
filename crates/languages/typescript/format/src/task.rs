use std::sync::Arc;

use oxc_formatter::JsFormatOptions;
use oxc_formatter_core::{FormatSession, InputKind, SessionServices};
use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::Span;
use rsvelte_stylesheet_format::tailwind::{OxcSorter, Sorter};
use rsvelte_typescript_tree::Parsed;

use crate::Options;

pub static PLUGIN: Plugin = Plugin {
    identifier: "typescript.format",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "typescript.tree",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

/// Registers the format with Prettier's defaults.
pub fn register(registry: &mut Registry) {
    register_with_options(registry, &Options::default(), None);
}

/// Registers the format with `options`; `tailwind` sorts the Tailwind CSS classes that
/// `options.sort_tailwindcss` finds.
///
/// # Panics
///
/// When [`Options::formatter`] refuses them; the caller checks that first.
pub fn register_with_options(
    registry: &mut Registry,
    options: &Options,
    tailwind: Option<Arc<Sorter>>,
) {
    registry.plugin(&PLUGIN);
    rsvelte_typescript_tree::register(registry);
    let formatter = options
        .formatter()
        .unwrap_or_else(|name| panic!("the `{name}` value was not checked"));
    registry.task(Format {
        formatter,
        tailwind,
    });
}

#[derive(Debug)]
pub struct Format {
    formatter: JsFormatOptions,
    tailwind: Option<Arc<Sorter>>,
}

impl Format {
    pub const IDENTIFIER: &'static str = "ts.format/default";
}

impl Task for Format {
    fn identifier(&self) -> &'static str {
        Self::IDENTIFIER
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_typescript_tree::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        let script = match context.get::<Parsed>() {
            Ok(script) => script,
            Err(error) => {
                out.diagnostics.push(error.clone());
                return;
            }
        };
        let program = script.tree.get_program(script.root);
        let oxc =
            (self.tailwind.as_ref()).map(|sorter| sorter.for_oxc(sorter.file_of(context.document)));
        let services = SessionServices {
            tailwind_sorter: oxc.as_ref().map(|o| Arc::clone(&o.sorter)),
            ..SessionServices::default()
        };
        let session = FormatSession::with_services(
            script.tree.allocator(),
            InputKind::PhysicalFile,
            services,
        );
        let printed =
            oxc_formatter::format_program_with_session(&session, program, self.formatter.clone())
                .print();
        if let Some(error) = oxc.as_ref().and_then(OxcSorter::failure) {
            out.diagnostics.push(Diagnostic::error(
                "format_tailwind",
                error.to_owned(),
                Span::new(0, 0),
            ));
            return;
        }
        match printed {
            Ok(printed) => out.file(
                if rsvelte_typescript_tree::is_typescript(context.document) {
                    "ts"
                } else {
                    "js"
                },
                printed.into_code(),
            ),
            Err(error) => out.diagnostics.push(Diagnostic::error(
                "format_failed",
                error.to_string(),
                Span::new(0, 0),
            )),
        }
    }
}

#[cfg(test)]
mod tests;
