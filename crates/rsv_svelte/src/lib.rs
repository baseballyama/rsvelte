//! Svelte 5 (runes) as a language plugin. Everything Svelte-specific is here; the kernel only
//! sees a [`Language`], three artifacts and the tasks registered by [`register`].
//!
//! Artifacts, computed at most once per document and shared by every task that asks:
//!
//! | artifact | output |
//! |---|---|
//! | [`Parsed`] | the surface tree ([`ast::Component`]) or the parse error |
//! | [`Analyzed`] | bindings, expression facts, CSS usage ([`analyze::Analysis`]) |
//! | [`ScopedCss`] | the component's CSS with scoping applied |
//! | [`TsProjection`] | the TypeScript view type checking reads ([`project::Projection`]) |

pub mod analyze;
pub mod ast;
pub mod evaluate;
pub mod format;
pub mod lint;
pub mod lower;
pub mod parse;
pub mod project;
pub mod tasks;

use rsv_kernel::db::{Artifact, Ctx};
use rsv_kernel::diag::Diagnostic;
use rsv_kernel::pipeline::{Language, Registry};

pub struct Svelte;

impl Language for Svelte {
    fn id(&self) -> &'static str {
        "svelte"
    }

    fn matches(&self, path: &str) -> bool {
        path.ends_with(".svelte")
    }
}

pub struct Parsed;

impl Artifact for Parsed {
    type Output = Result<ast::Component, Diagnostic>;
    const NAME: &'static str = "svelte.parse";

    fn compute(ctx: &Ctx) -> Self::Output {
        parse::parse(ctx.src())
    }
}

pub struct Analyzed;

impl Artifact for Analyzed {
    /// `None` when the document did not parse; the parse error is on [`Parsed`].
    type Output = Option<analyze::Analysis>;
    const NAME: &'static str = "svelte.analyze";

    fn compute(ctx: &Ctx) -> Self::Output {
        let c = ctx.get::<Parsed>().as_ref().ok()?;
        Some(analyze::analyze(c, ctx.src(), &ctx.doc.path))
    }
}

pub struct ScopedCss;

impl Artifact for ScopedCss {
    type Output = Option<String>;
    const NAME: &'static str = "svelte.css";

    fn compute(ctx: &Ctx) -> Self::Output {
        let c = ctx.get::<Parsed>().as_ref().ok()?;
        let an = ctx.get::<Analyzed>().as_ref()?;
        let style = c.style.as_ref()?;
        let hash = an
            .css_hash
            .as_deref()
            .expect("a component with a style has a hash");
        Some(rsv_css::scope::render(
            ctx.src(),
            &style.sheet,
            &an.css_used,
            hash,
        ))
    }
}

pub struct TsProjection;

impl Artifact for TsProjection {
    /// `None` when the document did not parse.
    type Output = Option<Result<project::Projection, rsv_kernel::diag::Unsupported>>;
    const NAME: &'static str = "svelte.project.ts";

    fn compute(ctx: &Ctx) -> Self::Output {
        let c = ctx.get::<Parsed>().as_ref().ok()?;
        Some(project::project(c, ctx.src()))
    }
}

/// What the plugin needs from its host beyond the documents.
#[derive(Default, Clone)]
pub struct Config {
    /// `None`: `svelte.check` reports that it is not configured.
    pub check: Option<CheckConfig>,
}

#[derive(Clone)]
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
        .artifact::<Analyzed>()
        .artifact::<ScopedCss>()
        .artifact::<TsProjection>();
    tasks::register(reg, config);
}
