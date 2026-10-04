use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::pipeline::{Document, Registry, Task, TaskOutput};
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::performance::measurement;
use rsvelte_vue::Parsed;

pub static PLUGIN: Plugin = Plugin {
    identifier: "vue.format",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "vue",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

pub fn register(registry: &mut Registry) {
    registry.plugin(&PLUGIN);
    rsvelte_vue::register(registry);
    registry.task(Format);
}

#[derive(Debug)]
pub struct Format;

impl Task for Format {
    fn identifier(&self) -> &'static str {
        "vue.format/default"
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_vue::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        let c = match context.get::<Parsed>() {
            Ok(c) => c,
            Err(e) => {
                out.diagnostics.push(e.clone());
                return;
            }
        };
        let formatted = {
            let _p = measurement::phase("vue.format");
            crate::format::format(c, context.source_text(), context.line_index())
        };
        match formatted {
            Ok(text) => out.file("vue", text),
            Err(u) => out.diagnostics.push(Diagnostic::error(
                "format_unsupported",
                format!("not supported by the formatter yet: {}", u.what),
                u.span(),
            )),
        }
    }
}
