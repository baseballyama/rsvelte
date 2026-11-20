use std::sync::Arc;

use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::LineBreaks;
use rsvelte_svelte_semantic::Resolved;
use rsvelte_svelte_syntax::Parsed;

use crate::Refusal;
use crate::syntax_tree::SyntaxTree;

/// The code of a [`EmittedProjection`] error that svelte2tsx throws, which svelte-check reports as
/// it is.
pub const THROWN: &str = "check_projection_thrown";

/// The identifier of the task that writes each component's projection and its source map.
pub const TASK: &str = "svelte.typescript_projection/default";

#[derive(Debug)]
pub struct ProjectionTree;

impl Artifact for ProjectionTree {
    type Output = Result<SyntaxTree, Diagnostic>;

    const NAME: &'static str = "svelte.typescript_projection.ast";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        // The projection never reads the style sheet, so its error does not stop it, as in
        // svelte2tsx.
        let component = context.get::<Parsed>().as_ref().map_err(Clone::clone)?;
        let resolution = || context.get::<Resolved>().as_ref();
        crate::lower(
            component,
            context.source_text(),
            &context.document.path,
            &resolution,
        )
        .map_err(|refusal| match refusal {
            Refusal::Unsupported(unsupported) => Diagnostic::error(
                "check_unsupported",
                format!(
                    "not supported by the type-check projection yet: {}",
                    unsupported.what
                ),
                unsupported.span(),
            ),
            Refusal::Thrown { message, span } => Diagnostic::error(THROWN, message, span),
        })
    }
}

#[derive(Debug)]
pub struct EmittedProjection;

impl Artifact for EmittedProjection {
    type Output = Result<Arc<Emitter>, Diagnostic>;

    const NAME: &'static str = "svelte.typescript_projection.emit";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let tree = context
            .get::<ProjectionTree>()
            .as_ref()
            .map_err(Clone::clone)?;
        Ok(Arc::new(crate::emit(
            tree,
            context.source_text(),
            &context.document.path,
        )))
    }
}

pub(crate) static PLUGIN: Plugin = Plugin {
    identifier: "svelte.typescript_projection",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[
        Dependency {
            identifier: "svelte.syntax",
            requirement: concat!("=", env!("CARGO_PKG_VERSION")),
        },
        Dependency {
            identifier: "svelte.semantic",
            requirement: concat!("=", env!("CARGO_PKG_VERSION")),
        },
    ],
};

pub fn register(registry: &mut Registry) {
    register_artifacts(registry);
    registry.task(Project);
}

pub fn register_artifacts(registry: &mut Registry) {
    registry.plugin(&PLUGIN);
    rsvelte_svelte_semantic::register(registry);
    registry
        .artifact::<ProjectionTree>()
        .artifact::<EmittedProjection>();
}

#[derive(Debug)]
struct Project;

impl Task for Project {
    fn identifier(&self) -> &'static str {
        TASK
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_svelte_syntax::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        match context.get::<EmittedProjection>() {
            Ok(projection) => {
                out.file("ts", projection.out.clone());
                out.file(
                    "ts.map",
                    projection.source_map(
                        context.source_text(),
                        context.lines(LineBreaks::Newline),
                        &context.document.path,
                    ),
                );
            }
            Err(diagnostic) => out.diagnostics.push(diagnostic.clone()),
        }
    }
}
