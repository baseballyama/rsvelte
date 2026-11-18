use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::performance::measurement;
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::LineBreaks;
use rsvelte_vue_syntax::Parsed;

pub static PLUGIN: Plugin = Plugin {
    identifier: "vue.format",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "vue.syntax",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

pub fn register(registry: &mut Registry) {
    registry.plugin(&PLUGIN);
    rsvelte_vue_syntax::register(registry);
    registry.task(Format);
}

#[derive(Debug)]
pub struct Format;

impl Task for Format {
    fn identifier(&self) -> &'static str {
        "vue.format/default"
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_vue_syntax::matches(document)
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
            crate::format::format(c, context.source_text(), context.lines(LineBreaks::Newline))
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
