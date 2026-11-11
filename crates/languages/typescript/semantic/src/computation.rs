//! Cached artifacts and plugin registration.

use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_typescript_tree::Parsed;

use crate::semantic::Semantic;

/// The scope analysis of a standalone JavaScript or TypeScript file; `None` when it does not
/// parse.
#[derive(Debug)]
pub struct Resolved;

impl Artifact for Resolved {
    type Output = Option<Semantic>;

    const NAME: &'static str = "ts.resolve";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let script = context.get::<Parsed>().as_ref().ok()?;
        // Cloning the tree shares it.
        Some(Semantic::program(script.tree.clone(), script.root))
    }
}

pub static PLUGIN: Plugin = Plugin {
    identifier: "typescript.semantic",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "typescript.tree",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

pub fn register(registry: &mut Registry) {
    registry.plugin(&PLUGIN);
    rsvelte_typescript_tree::register(registry);
    registry.artifact::<Resolved>();
}
