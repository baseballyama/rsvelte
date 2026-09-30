//! Vue single-file components as a language plugin: the second language on the kernel, built to
//! test what the kernel assumes. Everything Vue-specific is here; it shares `rsv_js` (parsing,
//! scope analysis, the core lint rules, printing, formatting) and `rsv_css` with the Svelte plugin.
//!
//! | artifact | output |
//! |---|---|
//! | [`Parsed`] | the surface tree ([`ast::Sfc`]) or the parse error |
//! | [`Resolved`] | one scope analysis, compileScript's binding types ([`resolve::Resolution`]) |
//! | [`TsProjection`] | the TypeScript view type checking reads ([`project::Projection`]) |

pub mod ast;
pub mod compile;
pub mod format;
pub mod lint;
pub mod parse;
pub mod project;
pub mod resolve;
pub mod tasks;

use rsv_kernel::db::{Artifact, Ctx};
use rsv_kernel::diag::Diagnostic;
use rsv_kernel::pipeline::{Language, Registry};

#[derive(Debug)]
pub struct Vue;

impl Language for Vue {
    fn id(&self) -> &'static str {
        "vue"
    }

    fn matches(&self, path: &str) -> bool {
        std::path::Path::new(path)
            .extension()
            .is_some_and(|e| e == "vue")
    }
}

#[derive(Debug)]
pub struct Parsed;

impl Artifact for Parsed {
    type Output = Result<ast::Sfc, Diagnostic>;

    const NAME: &'static str = "vue.parse";

    fn compute(ctx: &Ctx<'_>) -> Self::Output {
        parse::parse(ctx.src())
    }
}

#[derive(Debug)]
pub struct Resolved;

impl Artifact for Resolved {
    /// `None` when the document did not parse; the parse error is on [`Parsed`].
    type Output = Option<resolve::Resolution>;

    const NAME: &'static str = "vue.resolve";

    fn compute(ctx: &Ctx<'_>) -> Self::Output {
        let c = ctx.get::<Parsed>().as_ref().ok()?;
        Some(resolve::resolve(c, ctx.src()))
    }
}

#[derive(Debug)]
pub struct TsProjection;

impl Artifact for TsProjection {
    /// `None` when the document did not parse.
    type Output = Option<Result<project::Projection, rsv_kernel::diag::Unsupported>>;

    const NAME: &'static str = "vue.project.ts";

    fn compute(ctx: &Ctx<'_>) -> Self::Output {
        let c = ctx.get::<Parsed>().as_ref().ok()?;
        let res = ctx.get::<Resolved>().as_ref()?;
        Some(project::project(c, ctx.src(), res))
    }
}

/// What the plugin needs from its host beyond the documents.
#[derive(Default, Clone, Debug)]
pub struct Config {
    /// `None`: `vue.check` reports that it is not configured.
    pub check: Option<CheckConfig>,
}

#[derive(Clone, Debug)]
pub struct CheckConfig {
    /// The native `tsc` (TypeScript 7).
    pub tsc: std::path::PathBuf,
    /// The project's tsconfig.json.
    pub tsconfig: Option<std::path::PathBuf>,
    /// The installed `vue` package: its types declare `ref`, `computed` and the rest.
    pub vue: std::path::PathBuf,
}

pub fn register(reg: &mut Registry, config: &Config) {
    reg.language(Vue)
        .artifact::<Parsed>()
        .artifact::<Resolved>()
        .artifact::<TsProjection>();
    tasks::register(reg, config);
}
