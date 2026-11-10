use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::document::Document;
use rsvelte_svelte_syntax::syntax_tree::Component;

use crate::Options;

pub static PLUGIN: Plugin = Plugin {
    identifier: "svelte.format",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "svelte.syntax",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

pub fn register(registry: &mut Registry) {
    register_with_options(registry, Options::default());
}

pub fn register_with_options(registry: &mut Registry, options: Options) {
    registry.plugin(&PLUGIN);
    rsvelte_svelte_syntax::register(registry);
    registry.task(Format { options });
}

#[derive(Debug)]
pub struct Format {
    options: Options,
}

impl Format {
    pub const IDENTIFIER: &'static str = "svelte.format/default";
}

impl Task for Format {
    fn identifier(&self) -> &'static str {
        Self::IDENTIFIER
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_svelte_syntax::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        let c = match rsvelte_svelte_syntax::fully_parsed(context) {
            Ok(c) => c,
            Err(e) => {
                out.diagnostics.push(e.clone());
                return;
            }
        };
        match formatted(c, context.source_text(), &self.options) {
            Ok(text) => out.file("svelte", text),
            Err(diagnostic) => out.diagnostics.push(diagnostic),
        }
    }
}

/// Formats a component as prettier with prettier-plugin-svelte and `options` does.
///
/// # Errors
///
/// The parse error, or the first construct the formatter does not handle yet.
pub fn format(source_text: &str, options: &Options) -> Result<String, Diagnostic> {
    let component = rsvelte_svelte_syntax::parse::parse(source_text)?;
    formatted(&component, source_text, options)
}

fn formatted(
    component: &Component,
    source_text: &str,
    options: &Options,
) -> Result<String, Diagnostic> {
    crate::format::format(component, source_text, options).map_err(|u| {
        Diagnostic::error(
            "format_unsupported",
            format!("not supported by the formatter yet: {}", u.what),
            u.span(),
        )
    })
}

#[cfg(test)]
mod tests;
