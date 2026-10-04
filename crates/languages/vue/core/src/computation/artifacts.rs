use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_kernel::computation::pipeline::{Document, Registry};
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;

use crate::{compiler_syntax_tree, parse, resolve, syntax_tree};

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
pub struct Lowered;

impl Artifact for Lowered {
    /// `None` when the document did not parse or has no `<template>`.
    type Output = Option<compiler_syntax_tree::CompilerSyntaxTree>;

    const NAME: &'static str = "vue.compiler_syntax_tree";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let c = context.get::<Parsed>().as_ref().ok()?;
        compiler_syntax_tree::lower(c, context.source_text())
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
        let compiler_syntax_tree = context.get::<Lowered>().as_ref();
        Some(resolve::resolve(
            &c.javascript,
            c.program,
            compiler_syntax_tree,
            context.source_text(),
        ))
    }
}

pub static PLUGIN: Plugin = Plugin {
    identifier: "vue",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "typescript",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

pub fn register(reg: &mut Registry) {
    reg.plugin(&PLUGIN);
    rsvelte_typescript::register(reg);
    reg.artifact::<Parsed>()
        .artifact::<Lowered>()
        .artifact::<Resolved>();
}
