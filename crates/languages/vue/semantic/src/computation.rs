//! Cached artifacts and plugin registration.

use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_vue_syntax::Parsed;

use crate::{compiler_syntax_tree, resolve};

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
            None,
            compiler_syntax_tree,
        ))
    }
}

pub static PLUGIN: Plugin = Plugin {
    identifier: "vue.semantic",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "vue.syntax",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

pub fn register(reg: &mut Registry) {
    reg.plugin(&PLUGIN);
    rsvelte_vue_syntax::register(reg);
    reg.artifact::<Lowered>().artifact::<Resolved>();
}
