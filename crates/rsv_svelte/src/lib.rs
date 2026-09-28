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

pub mod analyze;
pub mod ast;
pub mod evaluate;
pub mod lower;
pub mod parse;
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

pub fn register(reg: &mut Registry) {
    reg.language(Svelte)
        .artifact::<Parsed>()
        .artifact::<Analyzed>()
        .artifact::<ScopedCss>();
    tasks::register(reg);
}
