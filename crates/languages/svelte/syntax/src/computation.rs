use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::document::Document;

use crate::parse::StyleCut;
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

/// The parse error each tool that cuts the style sheet out at the first closing tag it finds
/// reports, where the sheet holds one; only such a component is parsed again.
#[derive(Debug)]
pub struct CutStyle;

/// In declaration order, so a cut's discriminant is its index.
const CUTS: [StyleCut; 3] = [
    StyleCut::PrettierPluginSvelte,
    StyleCut::Svelte2tsx,
    StyleCut::SvelteEslintParser,
];

impl Artifact for CutStyle {
    type Output = [Option<Diagnostic>; 3];

    const NAME: &'static str = "svelte.parse.cut_style";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let component = context.get::<Parsed>().as_ref().ok();
        CUTS.map(|cut| crate::parse::cut_style_error(context.source_text(), component?, cut))
    }
}

/// The parse error `cut` reports: Svelte's own, or the one its cut of the style sheet makes.
pub fn cut_parse_error<'a>(
    context: &'a DocumentContext<'_>,
    cut: StyleCut,
) -> Option<&'a Diagnostic> {
    if let Err(error) = context.get::<Parsed>() {
        return Some(error);
    }
    context.get::<CutStyle>()[cut as usize].as_ref()
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
    registry.artifact::<CutStyle>();
}
