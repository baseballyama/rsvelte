//! Vue single-file components as a language plugin: the second language on the kernel, built to
//! test what the kernel assumes. Everything Vue-specific is here; it shares `rsvelte_javascript`
//! (parsing, scope analysis, the core lint rules, printing, formatting) and `rsvelte_stylesheet`
//! with the Svelte plugin.
//!
//! | artifact | output |
//! |---|---|
//! | [`Parsed`] | the surface tree ([`syntax_tree::SingleFileComponent`]) or the parse error |
//! | [`Resolved`] | one scope analysis, compileScript's binding types ([`resolve::Resolution`]) |

pub mod compile;
pub mod format;
pub mod lint;
pub mod parse;
pub mod project;
pub mod resolve;
pub mod syntax_tree;
pub mod tasks;

use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_kernel::computation::pipeline::{Document, Registry};
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;

#[must_use]
pub fn matches(document: &Document) -> bool {
    std::path::Path::new(&document.path)
        .extension()
        .is_some_and(|e| e == "vue")
}

#[derive(Debug)]
pub struct Parsed;

impl Artifact for Parsed {
    type Output = Result<syntax_tree::SingleFileComponent, Diagnostic>;

    const NAME: &'static str = "vue.parse";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        parse::parse(context.source_text())
    }
}

#[derive(Debug)]
pub struct Resolved;

impl Artifact for Resolved {
    /// `None` when the document did not parse; the parse error is on [`Parsed`].
    type Output = Option<resolve::Resolution>;

    const NAME: &'static str = "vue.resolve";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let c = context.get::<Parsed>().as_ref().ok()?;
        Some(resolve::resolve(c, context.source_text()))
    }
}

/// What the plugin needs from its host beyond the documents.
#[derive(Default, Clone, Debug)]
pub struct Configuration {
    /// `None`: `vue.check` reports that it is not configured.
    pub check: Option<TypeCheckConfiguration>,
}

#[derive(Clone, Debug)]
pub struct TypeCheckConfiguration {
    /// The native `tsc` (TypeScript 7).
    pub tsc: std::path::PathBuf,
    /// The project's tsconfig.json.
    pub tsconfig: Option<std::path::PathBuf>,
    /// The installed `vue` package: its types declare `ref`, `computed` and the rest.
    pub vue: std::path::PathBuf,
}

pub fn register(reg: &mut Registry, config: &Configuration) {
    reg.artifact::<Parsed>().artifact::<Resolved>();
    tasks::register(reg, config);
}
