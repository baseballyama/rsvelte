//! Cached artifacts and plugin registration.

use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::document::Document;

use crate::{parse, syntax_tree};

#[must_use]
pub fn matches(document: &Document) -> bool {
    std::path::Path::new(&document.path)
        .extension()
        .is_some_and(|e| e == "vue")
}

#[derive(Debug)]
pub struct Parsed;

impl Artifact for Parsed {
    type Output = Result<syntax_tree::SingleFileComponent, Diagnostic>;

    const NAME: &'static str = "vue.parse";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        parse::parse(context.source_text())
    }
}

pub static PLUGIN: Plugin = Plugin {
    identifier: "vue.syntax",
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
