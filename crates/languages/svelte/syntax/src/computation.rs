use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::document::Document;

use crate::syntax_tree::Component;

#[must_use]
pub fn matches(document: &Document) -> bool {
    document.path.ends_with(".svelte")
}

#[derive(Debug)]
pub struct Parsed;

impl Artifact for Parsed {
    type Output = Result<Component, Diagnostic>;

    const NAME: &'static str = "svelte.parse";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        crate::parse::parse(context.source_text())
    }
}

pub static PLUGIN: Plugin = Plugin {
    identifier: "svelte.syntax",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "typescript.syntax",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

pub fn register(registry: &mut Registry) {
    registry.plugin(&PLUGIN);
    rsvelte_typescript_syntax::register(registry);
    registry.artifact::<Parsed>();
}
