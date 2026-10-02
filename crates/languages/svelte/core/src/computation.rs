//! Cached artifacts and plugin registration.

use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_kernel::computation::pipeline::{Document, Registry};
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;

use crate::compilation::{compiler_syntax_tree, input};
use crate::semantic::{analyze, resolve};
use crate::syntax::{parse, syntax_tree};

#[must_use]
pub fn matches(document: &Document) -> bool {
    document.path.ends_with(".svelte")
}

#[derive(Debug)]
pub struct Parsed;

impl Artifact for Parsed {
    type Output = Result<syntax_tree::Component, Diagnostic>;

    const NAME: &'static str = "svelte.parse";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        parse::parse(context.source_text())
    }
}

#[derive(Debug)]
pub struct Resolved;

impl Artifact for Resolved {
    /// `None` when the document did not parse; the parse error is on [`Parsed`].
    type Output = Option<resolve::Resolution>;

    const NAME: &'static str = "svelte.resolve";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let c = context.get::<Parsed>().as_ref().ok()?;
        let compiler_syntax_tree = context.get::<Normalized>().as_ref()?;
        Some(resolve::resolve(
            &c.javascript,
            c.program,
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
pub struct Planned;

impl Artifact for Planned {
    type Output = Option<crate::compilation::render_plan::RenderPlan>;

    const NAME: &'static str = "svelte.render_plan";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        Some(crate::compilation::render_plan::RenderPlan::build(
            &compile_input(context)?,
        ))
    }
}

#[derive(Debug)]
pub struct Analyzed;

impl Artifact for Analyzed {
    /// `None` when the document did not parse; the parse error is on [`Parsed`].
    type Output = Option<analyze::Analysis>;

    const NAME: &'static str = "svelte.analyze";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let input = compile_input(context)?;
        let res = context.get::<Resolved>().as_ref()?;
        Some(analyze::analyze(&input, res, &context.document.path))
    }
}

#[derive(Debug)]
pub struct ScopedStylesheet;

impl Artifact for ScopedStylesheet {
    type Output = Option<String>;

    const NAME: &'static str = "svelte.css";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let an = context.get::<Analyzed>().as_ref()?;
        crate::compilation::stylesheet::scoped_stylesheet(&compile_input(context)?, an)
    }
}

/// What the compiler reads of a Svelte component: its script from [`Parsed`], its template from
/// [`Normalized`]. `None` when the document did not parse.
#[must_use]
pub fn compile_input<'a>(context: &'a DocumentContext<'_>) -> Option<input::CompileInput<'a>> {
    let c = context.get::<Parsed>().as_ref().ok()?;
    let compiler_syntax_tree = context.get::<Normalized>().as_ref()?;
    Some(svelte_input(c, compiler_syntax_tree, context.source_text()))
}

/// [`compile_input`] outside the artifact database.
#[must_use]
pub fn svelte_input<'a>(
    c: &'a syntax_tree::Component,
    compiler_syntax_tree: &'a compiler_syntax_tree::CompilerSyntaxTree,
    source_text: &'a str,
) -> input::CompileInput<'a> {
    input::CompileInput {
        javascript: &c.javascript,
        program: c.program,
        compiler_syntax_tree,
        style: c.style.as_ref().map(|s| &s.sheet),
        template_expressions: &c.template_expressions,
        source_text,
        preserve_whitespace: false,
    }
}

pub fn register(reg: &mut Registry) {
    reg.artifact::<Parsed>()
        .artifact::<Resolved>()
        .artifact::<Normalized>()
        .artifact::<Analyzed>()
        .artifact::<Planned>()
        .artifact::<ScopedStylesheet>();
}
