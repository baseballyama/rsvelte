//! Cached artifacts and plugin registration.

pub mod tasks;

use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_kernel::computation::pipeline::{Document, Registry};
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;

use crate::compilation::{compiler_syntax_tree, lower};
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
        tasks::scoped_stylesheet(&compile_input(context)?, an)
    }
}

/// What the compiler reads of a Svelte component: its script from [`Parsed`], its template from
/// [`Normalized`]. `None` when the document did not parse.
#[must_use]
pub fn compile_input<'a>(context: &'a DocumentContext<'_>) -> Option<lower::CompileInput<'a>> {
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
) -> lower::CompileInput<'a> {
    lower::CompileInput {
        javascript: &c.javascript,
        program: c.program,
        compiler_syntax_tree,
        style: c.style.as_ref().map(|s| &s.sheet),
        template_expressions: &c.template_expressions,
        source_text,
        preserve_whitespace: false,
    }
}

/// What the plugin needs from its host beyond the documents.
#[derive(Default, Clone, Debug)]
pub struct Configuration {
    /// `None`: `svelte.check` reports that it is not configured.
    pub check: Option<TypeCheckConfiguration>,
}

#[derive(Clone, Debug)]
pub struct TypeCheckConfiguration {
    /// The native `tsc` (TypeScript 7).
    pub tsc: std::path::PathBuf,
    /// The project's tsconfig.json.
    pub tsconfig: Option<std::path::PathBuf>,
    /// The installed `svelte` package: its types declare the runes and `svelte/elements`.
    pub svelte: std::path::PathBuf,
}

pub fn register(reg: &mut Registry, config: &Configuration) {
    reg.artifact::<Parsed>()
        .artifact::<Resolved>()
        .artifact::<Normalized>()
        .artifact::<Analyzed>()
        .artifact::<ScopedStylesheet>();
    tasks::register(reg, config);
}
