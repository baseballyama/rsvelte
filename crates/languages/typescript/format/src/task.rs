use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::pipeline::{Document, Registry, Task, TaskOutput};
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::output::document::{LayoutInstructions, PrintOptions};
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript::Parsed;

use crate::format;

pub fn register(registry: &mut Registry) {
    rsvelte_typescript::register(registry);
    registry.task(Format);
}

#[derive(Debug)]
pub struct Format;

impl Task for Format {
    fn identifier(&self) -> &'static str {
        "ts.format/default"
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_typescript::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        let program = match context.get::<Parsed>() {
            Ok(program) => program,
            Err(error) => {
                out.diagnostics.push(error.clone());
                return;
            }
        };
        let mut docs = LayoutInstructions::new();
        let mut formatter = format::Formatter::new(
            &program.syntax_tree,
            context.source_text(),
            context.line_index(),
            &mut docs,
            format::Options::default(),
        );
        match formatter.program(program.root) {
            Err(unsupported) => out.diagnostics.push(Diagnostic::error(
                "format_unsupported",
                format!("not supported by the formatter yet: {}", unsupported.what),
                unsupported.span(),
            )),
            Ok(root) => match docs.print(root, &PrintOptions::default()) {
                Ok(text) => out.file(
                    if rsvelte_typescript::is_typescript(context.document) {
                        "ts"
                    } else {
                        "js"
                    },
                    text,
                ),
                Err(_) => out.diagnostics.push(Diagnostic::error(
                    "format_unsupported",
                    "not supported by the formatter yet: multiline layout",
                    Span::new(0, context.source_text().len() as u32),
                )),
            },
        }
    }
}
