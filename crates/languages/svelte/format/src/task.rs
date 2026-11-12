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
    dependencies: &[
        Dependency {
            identifier: "svelte.syntax",
            requirement: concat!("=", env!("CARGO_PKG_VERSION")),
        },
        Dependency {
            identifier: "svelte.semantic",
            requirement: concat!("=", env!("CARGO_PKG_VERSION")),
        },
    ],
};

pub fn register(registry: &mut Registry) {
    register_with_options(registry, Options::default());
}

pub fn register_with_options(registry: &mut Registry, options: Options) {
    registry.plugin(&PLUGIN);
    rsvelte_svelte_semantic::register(registry);
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
        // The plugin takes the style sheet out before Svelte parses, so its errors do not count.
        let c = match context.get::<rsvelte_svelte_syntax::Parsed>() {
            Ok(c) => c,
            Err(e) => {
                out.diagnostics.push(e.clone());
                return;
            }
        };
        let rejected = context
            .get::<rsvelte_svelte_semantic::Resolved>()
            .as_ref()
            .and_then(|resolution| resolution.syntax_error());
        match formatted(c, context.source_text(), &self.options, rejected) {
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
    let rejected = crate::format::rejected(&component, source_text);
    formatted(&component, source_text, options, rejected.as_ref())
}

fn formatted(
    component: &Component,
    source_text: &str,
    options: &Options,
    rejected: Option<&Diagnostic>,
) -> Result<String, Diagnostic> {
    crate::format::format(component, source_text, options, rejected).map_err(|u| {
        Diagnostic::error(
            "format_unsupported",
            format!("not supported by the formatter yet: {}", u.what),
            u.span(),
        )
    })
}

#[cfg(test)]
mod tests;
