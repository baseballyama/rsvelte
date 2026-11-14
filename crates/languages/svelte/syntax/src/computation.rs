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

/// The component when every part of it parsed, its style sheet included.
///
/// The compiler and the type checker read this. Lint reads [`Parsed`] and tolerates a style
/// sheet's error, as `svelte-eslint-parser` does; the formatter reads
/// [`parsed_reading_scripts_as_typescript`].
///
/// # Errors
///
/// The parse error, or the style sheet's.
pub fn fully_parsed<'a>(context: &'a DocumentContext<'_>) -> Result<&'a Component, &'a Diagnostic> {
    let component = context.get::<Parsed>().as_ref()?;
    component.style_error().map_or(Ok(component), Err)
}

/// The component as [`crate::parse::parse_reading_scripts_as_typescript`] reads it, for a
/// document [`Parsed`] rejects.
#[derive(Debug)]
pub struct ParsedAsTypeScript;

impl Artifact for ParsedAsTypeScript {
    type Output = Result<Component, Diagnostic>;

    const NAME: &'static str = "svelte.parse.typescript";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        crate::parse::parse_reading_scripts_as_typescript(context.source_text())
    }
}

/// The component as Prettier's Svelte plugin reads it: a script the compiler rejects is read as
/// TypeScript, and a style sheet's error does not count, as the plugin takes the sheet out first.
///
/// # Errors
///
/// The parse error outside the scripts, or TypeScript's first error in a script.
pub fn parsed_reading_scripts_as_typescript<'a>(
    context: &'a DocumentContext<'_>,
) -> Result<&'a Component, &'a Diagnostic> {
    // Most documents parse, and are read once.
    let component = match context.get::<Parsed>() {
        Ok(component) => component,
        Err(_) => context.get::<ParsedAsTypeScript>().as_ref()?,
    };
    (component.script_typescript_errors.first())
        .map_or(Ok(component), |error| Err(&error.diagnostic))
}

pub static PLUGIN: Plugin = Plugin {
    identifier: "svelte.syntax",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "typescript.tree",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

pub fn register(registry: &mut Registry) {
    registry.plugin(&PLUGIN);
    rsvelte_typescript_tree::register(registry);
    registry.artifact::<Parsed>();
    registry.artifact::<ParsedAsTypeScript>();
}
