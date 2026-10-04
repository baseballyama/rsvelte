use std::path::Path;

use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_kernel::computation::pipeline::{Document, Registry};
use rsvelte_kernel::computation::plugins::Plugin;
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::source::positions::Span;

use crate::{NodeIdentifier, SyntaxTree, parser, scope};

#[must_use]
pub fn matches(document: &Document) -> bool {
    is_typescript(document)
        || Path::new(&document.path)
            .extension()
            .is_some_and(|extension| matches!(extension.to_str(), Some("js" | "mjs" | "cjs")))
}

#[must_use]
pub fn is_typescript(document: &Document) -> bool {
    Path::new(&document.path)
        .extension()
        .is_some_and(|extension| matches!(extension.to_str(), Some("ts" | "mts" | "cts")))
}

#[derive(Debug)]
pub struct Program {
    pub syntax_tree: SyntaxTree,
    pub root: NodeIdentifier,
}

#[derive(Debug)]
pub struct Parsed;

impl Artifact for Parsed {
    type Output = Result<Program, Diagnostic>;

    const NAME: &'static str = "ts.parse";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let source = context.source_text();
        let mut syntax_tree = SyntaxTree::new();
        let root = parser::parse_program(
            &mut syntax_tree,
            source,
            Span::new(0, source.len() as u32),
            is_typescript(context.document),
        )
        .map_err(|error| Diagnostic::error("parse_error", error.message, error.span))?;
        Ok(Program { syntax_tree, root })
    }
}

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
    identifier: "typescript",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[],
};

pub fn register(registry: &mut Registry) {
    registry.plugin(&PLUGIN);
    registry.artifact::<Parsed>().artifact::<Resolved>();
}
