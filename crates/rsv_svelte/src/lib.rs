//! Svelte 5 (runes) as a language plugin. Everything Svelte-specific is here; the kernel only
//! sees a [`Language`], three artifacts and the tasks registered by [`register`].
//!
//! Artifacts, computed at most once per document and shared by every task that asks:
//!
//! | artifact | output |
//! |---|---|
//! | [`Parsed`] | the surface tree ([`ast::Component`]) or the parse error |
//! | [`Resolved`] | scopes, references resolved to bindings, rune kinds ([`resolve::Resolution`]) |
//! | [`Normalized`] | the template as the compiler understands it ([`hir::Hir`]) |
//! | [`Analyzed`] | expression facts, dynamic fragments, CSS usage ([`analyze::Analysis`]) |
//! | [`ScopedCss`] | the component's CSS with scoping applied |
//! | [`TsProjection`] | the TypeScript view type checking reads ([`project::Projection`]) |

pub mod analyze;
pub mod ast;
pub mod evaluate;
pub mod format;
pub mod hir;
pub mod lint;
pub mod lower;
pub mod parse;
pub mod project;
pub mod resolve;
pub mod tasks;

use rsv_kernel::db::{Artifact, Ctx};
use rsv_kernel::diag::Diagnostic;
use rsv_kernel::pipeline::{Language, Registry};

#[derive(Debug)]
pub struct Svelte;

impl Language for Svelte {
    fn id(&self) -> &'static str {
        "svelte"
    }

    fn matches(&self, path: &str) -> bool {
        path.ends_with(".svelte")
    }
}

#[derive(Debug)]
pub struct Parsed;

impl Artifact for Parsed {
    type Output = Result<ast::Component, Diagnostic>;

    const NAME: &'static str = "svelte.parse";

    fn compute(ctx: &Ctx<'_>) -> Self::Output {
        parse::parse(ctx.src())
    }
}

#[derive(Debug)]
pub struct Resolved;

impl Artifact for Resolved {
    /// `None` when the document did not parse; the parse error is on [`Parsed`].
    type Output = Option<resolve::Resolution>;

    const NAME: &'static str = "svelte.resolve";

    fn compute(ctx: &Ctx<'_>) -> Self::Output {
        let c = ctx.get::<Parsed>().as_ref().ok()?;
        Some(resolve::resolve(&c.js, c.program, &c.template_exprs))
    }
}

#[derive(Debug)]
pub struct Normalized;

impl Artifact for Normalized {
    /// `None` when the document did not parse.
    type Output = Option<hir::Hir>;

    const NAME: &'static str = "svelte.hir";

    fn compute(ctx: &Ctx<'_>) -> Self::Output {
        let c = ctx.get::<Parsed>().as_ref().ok()?;
        Some(hir::lower(c, ctx.src()))
    }
}

#[derive(Debug)]
pub struct Analyzed;

impl Artifact for Analyzed {
    /// `None` when the document did not parse; the parse error is on [`Parsed`].
    type Output = Option<analyze::Analysis>;

    const NAME: &'static str = "svelte.analyze";

    fn compute(ctx: &Ctx<'_>) -> Self::Output {
        let input = compile_input(ctx)?;
        let res = ctx.get::<Resolved>().as_ref()?;
        Some(analyze::analyze(&input, res, &ctx.doc.path))
    }
}

#[derive(Debug)]
pub struct ScopedCss;

impl Artifact for ScopedCss {
    type Output = Option<String>;

    const NAME: &'static str = "svelte.css";

    fn compute(ctx: &Ctx<'_>) -> Self::Output {
        let an = ctx.get::<Analyzed>().as_ref()?;
        tasks::scoped_css(&compile_input(ctx)?, an)
    }
}

#[derive(Debug)]
pub struct TsProjection;

impl Artifact for TsProjection {
    /// `None` when the document did not parse.
    type Output = Option<Result<project::Projection, rsv_kernel::diag::Unsupported>>;

    const NAME: &'static str = "svelte.project.ts";

    fn compute(ctx: &Ctx<'_>) -> Self::Output {
        let c = ctx.get::<Parsed>().as_ref().ok()?;
        Some(project::project(c, ctx.src()))
    }
}

/// What the compiler reads of a Svelte component: its script from [`Parsed`], its template from
/// [`Normalized`]. `None` when the document did not parse.
#[must_use]
pub fn compile_input<'a>(ctx: &'a Ctx<'_>) -> Option<lower::CompileInput<'a>> {
    let c = ctx.get::<Parsed>().as_ref().ok()?;
    let hir = ctx.get::<Normalized>().as_ref()?;
    Some(svelte_input(c, hir, ctx.src()))
}

/// [`compile_input`] outside the artifact database.
#[must_use]
pub fn svelte_input<'a>(
    c: &'a ast::Component,
    hir: &'a hir::Hir,
    src: &'a str,
) -> lower::CompileInput<'a> {
    lower::CompileInput {
        js: &c.js,
        program: c.program,
        hir,
        style: c.style.as_ref().map(|s| &s.sheet),
        template_exprs: &c.template_exprs,
        src,
    }
}

/// What the plugin needs from its host beyond the documents.
#[derive(Default, Clone, Debug)]
pub struct Config {
    /// `None`: `svelte.check` reports that it is not configured.
    pub check: Option<CheckConfig>,
}

#[derive(Clone, Debug)]
pub struct CheckConfig {
    /// The native `tsc` (TypeScript 7).
    pub tsc: std::path::PathBuf,
    /// The project's tsconfig.json.
    pub tsconfig: Option<std::path::PathBuf>,
    /// The installed `svelte` package: its types declare the runes and `svelte/elements`.
    pub svelte: std::path::PathBuf,
}

pub fn register(reg: &mut Registry, config: &Config) {
    reg.language(Svelte)
        .artifact::<Parsed>()
        .artifact::<Resolved>()
        .artifact::<Normalized>()
        .artifact::<Analyzed>()
        .artifact::<ScopedCss>()
        .artifact::<TsProjection>();
    tasks::register(reg, config);
}
