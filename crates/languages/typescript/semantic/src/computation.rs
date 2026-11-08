//! Cached artifacts and plugin registration.

use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_typescript_syntax::Parsed;

use crate::scope;

#[derive(Debug)]
pub struct Resolved;

impl Artifact for Resolved {
    type Output = Option<scope::Semantic>;

    const NAME: &'static str = "ts.resolve";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let program = context.get::<Parsed>().as_ref().ok()?;
        Some(scope::analyze(&program.syntax_tree, program.root, &[]))
    }
}

pub static PLUGIN: Plugin = Plugin {
    identifier: "typescript.semantic",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "typescript.syntax",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

pub fn register(registry: &mut Registry) {
    registry.plugin(&PLUGIN);
    rsvelte_typescript_syntax::register(registry);
    registry.artifact::<Resolved>();
}
