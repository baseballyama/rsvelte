use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::document::Document;
use rsvelte_svelte_syntax::syntax_tree::Component;

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

/// The component when every part of it parsed, its style sheet included.
///
/// The compiler, the formatter and the type checker read this. Lint reads [`Parsed`] and
/// tolerates a style sheet's error, as `svelte-eslint-parser` does.
///
/// # Errors
///
/// The parse error, or the style sheet's.
pub fn fully_parsed<'a>(context: &'a DocumentContext<'_>) -> Result<&'a Component, &'a Diagnostic> {
    let component = context.get::<Parsed>().as_ref()?;
    component.style_error().map_or(Ok(component), Err)
}

pub static PLUGIN: Plugin = Plugin {
    identifier: "svelte.parser",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "typescript",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

pub fn register(registry: &mut Registry) {
    registry.plugin(&PLUGIN);
    rsvelte_typescript::register(registry);
    registry.artifact::<Parsed>();
}
