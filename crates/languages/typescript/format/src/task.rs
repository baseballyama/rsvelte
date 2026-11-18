use oxc_formatter::JsFormatOptions;
use oxc_formatter_core::LineWidth;
use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_tree::Parsed;

pub static PLUGIN: Plugin = Plugin {
    identifier: "typescript.format",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "typescript.tree",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

pub fn register(registry: &mut Registry) {
    registry.plugin(&PLUGIN);
    rsvelte_typescript_tree::register(registry);
    registry.task(Format);
}

#[derive(Debug)]
pub struct Format;

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
        match oxc_formatter::format_program(script.tree.allocator(), program, prettier_defaults())
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

/// Prettier's defaults; oxc's differ only in the line width.
fn prettier_defaults() -> JsFormatOptions {
    JsFormatOptions {
        line_width: LineWidth::try_from(80).expect("80 is a valid line width"),
        ..JsFormatOptions::default()
    }
}
