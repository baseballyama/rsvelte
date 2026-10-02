use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::pipeline::{Document, Registry, Task, TaskOutput};
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_svelte::Parsed;

pub fn register(registry: &mut Registry) {
    rsvelte_svelte::register(registry);
    registry.task(Format);
}

#[derive(Debug)]
pub struct Format;

impl Task for Format {
    fn identifier(&self) -> &'static str {
        "svelte.format/default"
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_svelte::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        let c = match context.get::<Parsed>() {
            Ok(c) => c,
            Err(e) => {
                out.diagnostics.push(e.clone());
                return;
            }
        };
        match crate::format::format(c, context.source_text(), context.line_index()) {
            Ok(text) => out.file("svelte", text),
            Err(u) => out.diagnostics.push(Diagnostic::error(
                "format_unsupported",
                format!("not supported by the formatter yet: {}", u.what),
                u.span(),
            )),
        }
    }
}
