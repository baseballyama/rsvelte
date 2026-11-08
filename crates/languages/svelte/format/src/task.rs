use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::LineIndex;
use rsvelte_svelte_syntax::Parsed;
use rsvelte_svelte_syntax::syntax_tree::Component;

pub static PLUGIN: Plugin = Plugin {
    identifier: "svelte.format",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "svelte.syntax",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

pub fn register(registry: &mut Registry) {
    registry.plugin(&PLUGIN);
    rsvelte_svelte_syntax::register(registry);
    registry.task(Format);
}

#[derive(Debug)]
pub struct Format;

impl Task for Format {
    fn identifier(&self) -> &'static str {
        "svelte.format/default"
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_svelte_syntax::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        let c = match context.get::<Parsed>() {
            Ok(c) => c,
            Err(e) => {
                out.diagnostics.push(e.clone());
                return;
            }
        };
        match formatted(c, context.source_text(), context.line_index()) {
            Ok(text) => out.file("svelte", text),
            Err(diagnostic) => out.diagnostics.push(diagnostic),
        }
    }
}

/// Formats a component as prettier with prettier-plugin-svelte and the default options does.
///
/// # Errors
///
/// The parse error, or the first construct the formatter does not handle yet.
pub fn format(source_text: &str) -> Result<String, Diagnostic> {
    let component = rsvelte_svelte_syntax::parse::parse(source_text)?;
    formatted(&component, source_text, &LineIndex::new(source_text))
}

fn formatted(
    component: &Component,
    source_text: &str,
    lines: &LineIndex,
) -> Result<String, Diagnostic> {
    crate::format::format(component, source_text, lines).map_err(|u| {
        Diagnostic::error(
            "format_unsupported",
            format!("not supported by the formatter yet: {}", u.what),
            u.span(),
        )
    })
}

#[cfg(test)]
mod tests;
