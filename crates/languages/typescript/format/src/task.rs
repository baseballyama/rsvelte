use oxc_formatter::JsFormatOptions;
use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_tree::Parsed;

use crate::Options;

pub(crate) static PLUGIN: Plugin = Plugin {
    identifier: "typescript.format",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "typescript.tree",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

/// Registers the format with Prettier's defaults.
pub fn register(registry: &mut Registry) {
    register_with_options(registry, &Options::default());
}

/// Registers the format with `options`.
///
/// # Panics
///
/// When [`Options::formatter`] refuses them; the caller checks that first.
pub(crate) fn register_with_options(registry: &mut Registry, options: &Options) {
    registry.plugin(&PLUGIN);
    rsvelte_typescript_tree::register(registry);
    let formatter = options
        .formatter()
        .unwrap_or_else(|name| panic!("the `{name}` value was not checked"));
    registry.task(Format { formatter });
}

#[derive(Debug)]
pub(crate) struct Format {
    formatter: JsFormatOptions,
}

impl Task for Format {
    fn identifier(&self) -> &'static str {
        "ts.format/default"
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
        match oxc_formatter::format_program(
            script.tree.allocator(),
            program,
            self.formatter.clone(),
        )
        .print()
        {
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
