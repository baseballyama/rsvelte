use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_kernel::computation::pipeline::{Document, Registry, Task, TaskOutput};
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_svelte_parser::Parsed;

use crate::syntax_tree::SyntaxTree;

#[derive(Debug)]
pub struct Projected;

impl Artifact for Projected {
    type Output = Result<SyntaxTree, Diagnostic>;

    const NAME: &'static str = "svelte.typescript_projection.ast";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let component = context.get::<Parsed>().as_ref().map_err(Clone::clone)?;
        crate::lower(component, context.source_text()).map_err(|unsupported| {
            Diagnostic::error(
                "check_unsupported",
                format!(
                    "not supported by the type-check projection yet: {}",
                    unsupported.what
                ),
                unsupported.span(),
            )
        })
    }
}

#[derive(Debug)]
pub struct Printed;

impl Artifact for Printed {
    type Output = Result<Emitter, Diagnostic>;

    const NAME: &'static str = "svelte.typescript_projection.emit";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let tree = context.get::<Projected>().as_ref().map_err(Clone::clone)?;
        Ok(crate::emit(tree, context.source_text()))
    }
}

pub static PLUGIN: Plugin = Plugin {
    identifier: "svelte.typescript_projection",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "svelte.parser",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

pub fn register(registry: &mut Registry) {
    register_artifacts(registry);
    registry.task(Project);
}

pub fn register_artifacts(registry: &mut Registry) {
    registry.plugin(&PLUGIN);
    rsvelte_svelte_parser::register(registry);
    registry.artifact::<Projected>().artifact::<Printed>();
}

#[derive(Debug)]
struct Project;

impl Task for Project {
    fn identifier(&self) -> &'static str {
        "svelte.typescript_projection/default"
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_svelte_parser::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        match context.get::<Printed>() {
            Ok(projection) => {
                out.file("ts", projection.out.clone());
                out.file(
                    "ts.map",
                    projection.source_map(context.source_text(), &context.document.path),
                );
            }
            Err(diagnostic) => out.diagnostics.push(diagnostic.clone()),
        }
    }
}
