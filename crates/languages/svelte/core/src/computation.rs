//! Cached artifacts and plugin registration.

use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_kernel::computation::pipeline::Registry;
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
pub use rsvelte_svelte_parser::{Parsed, matches};

use crate::compilation::compiler_syntax_tree;
use crate::semantic::{analyze, input, resolve};
use crate::syntax::syntax_tree;

#[derive(Debug)]
pub struct Resolved;

impl Artifact for Resolved {
    /// `None` when the document did not parse; the parse error is on [`Parsed`].
    type Output = Option<resolve::Resolution>;

    const NAME: &'static str = "svelte.resolve";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let c = context.get::<Parsed>().as_ref().ok()?;
        let compiler_syntax_tree = context.get::<Normalized>().as_ref()?;
        Some(resolve::resolve_with_module(
            &c.javascript,
            c.program,
            c.module.as_ref().map(|s| s.program),
            compiler_syntax_tree,
        ))
    }
}

#[derive(Debug)]
pub struct Normalized;

impl Artifact for Normalized {
    /// `None` when the document did not parse.
    type Output = Option<compiler_syntax_tree::CompilerSyntaxTree>;

    const NAME: &'static str = "svelte.compiler_syntax_tree";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let c = context.get::<Parsed>().as_ref().ok()?;
        Some(compiler_syntax_tree::lower(c, context.source_text()))
    }
}

#[derive(Debug)]
pub struct Analyzed;

impl Artifact for Analyzed {
    /// `None` when the document did not parse; the parse error is on [`Parsed`].
    type Output = Option<analyze::Analysis>;

    const NAME: &'static str = "svelte.analyze";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let input = component_input(context)?;
        let res = context.get::<Resolved>().as_ref()?;
        Some(analyze::analyze(&input, res))
    }
}

/// What the compiler reads of a Svelte component: its script from [`Parsed`], its template from
/// [`Normalized`]. `None` when the document did not parse.
#[must_use]
pub fn component_input<'a>(context: &'a DocumentContext<'_>) -> Option<input::ComponentInput<'a>> {
    let c = context.get::<Parsed>().as_ref().ok()?;
    let compiler_syntax_tree = context.get::<Normalized>().as_ref()?;
    Some(svelte_input(
        c,
        compiler_syntax_tree,
        context.source_text(),
        &context.document.path,
    ))
}

/// [`component_input`] outside the artifact database.
#[must_use]
pub fn svelte_input<'a>(
    c: &'a syntax_tree::Component,
    compiler_syntax_tree: &'a compiler_syntax_tree::CompilerSyntaxTree,
    source_text: &'a str,
    filename: &'a str,
) -> input::ComponentInput<'a> {
    input::ComponentInput {
        javascript: &c.javascript,
        program: c.program,
        module: c.module.as_ref().map(|s| s.program),
        compiler_syntax_tree,
        style: c.style.as_ref().map(|s| &s.sheet),
        template_expressions: &c.template_expressions,
        source_text,
        filename,
    }
}

pub static PLUGIN: Plugin = Plugin {
    identifier: "svelte",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "svelte.parser",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

pub fn register(reg: &mut Registry) {
    reg.plugin(&PLUGIN);
    rsvelte_svelte_parser::register(reg);
    reg.artifact::<Resolved>()
        .artifact::<Normalized>()
        .artifact::<Analyzed>();
}
