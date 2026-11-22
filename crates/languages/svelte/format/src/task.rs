use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::Component;

use crate::Options;
use crate::tailwind::Tailwind;

static PLUGIN: Plugin = Plugin {
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

pub(crate) fn register_with_options(registry: &mut Registry, options: Options) {
    registry.plugin(&PLUGIN);
    rsvelte_svelte_semantic::register(registry);
    registry.task(Format { options });
}

/// The identifier of the task that formats each component.
pub const TASK: &str = "svelte.format/default";

/// The task that formats each component with `options`, from the parse the document's other
/// tasks share.
#[derive(Debug)]
pub struct Format {
    options: Options,
}

impl Format {
    #[must_use]
    pub const fn new(options: Options) -> Self {
        Self { options }
    }
}

impl Task for Format {
    fn identifier(&self) -> &'static str {
        TASK
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_svelte_syntax::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        // The plugin takes the style sheet out before Svelte parses, so its errors do not count.
        let c = match rsvelte_svelte_syntax::parsed_reading_scripts_as_typescript(context) {
            Ok(c) => c,
            Err(e) => {
                out.diagnostics.push(e.clone());
                return;
            }
        };
        let own;
        let rejected = if context.get::<rsvelte_svelte_syntax::Parsed>().is_ok() {
            (context.get::<rsvelte_svelte_semantic::Resolved>().as_ref())
                .and_then(|resolution| resolution.javascript_syntax_error())
        } else {
            // A component only the TypeScript read gives has no resolution of its own. Its first
            // error refuses even where Babel recovers, which is conservative: a later one Babel
            // throws on is not known.
            own = crate::printer::first_module_syntax_error(c, context.source_text());
            own.as_ref()
        };
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
    let mut component = crate::printer::parsed(source_text)?;
    // The plugin sorts the classes of the tree it parsed, and prints the sorted tree.
    let sorted = match &options.tailwind {
        Some(tailwind) => crate::tailwind::sorted(&component, source_text, tailwind)
            .map_err(|error| Diagnostic::error("format_tailwind", error, Span::new(0, 0)))?,
        None => None,
    };
    let source_text = match &sorted {
        Some(sorted) => {
            component = crate::printer::parsed(sorted)?;
            sorted
        }
        None => source_text,
    };
    let rejected = crate::printer::first_module_syntax_error(&component, source_text);
    let formatted = formatted(&component, source_text, options, rejected.as_ref())?;
    (options.tailwind.as_ref().and_then(Tailwind::take_failure)).map_or(Ok(formatted), |error| {
        Err(Diagnostic::error("format_tailwind", error, Span::new(0, 0)))
    })
}

fn formatted(
    component: &Component,
    source_text: &str,
    options: &Options,
    rejected: Option<&rsvelte_typescript_tree::SyntaxError>,
) -> Result<String, Diagnostic> {
    crate::printer::print_component(component, source_text, options, rejected)
        .map_err(|u| u.diagnostic("format_unsupported", Some("the formatter")))
}

#[cfg(test)]
mod tests;
