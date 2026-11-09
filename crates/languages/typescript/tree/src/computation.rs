use std::path::Path;

use oxc_span::SourceType;
use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_kernel::computation::plugins::Plugin;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;

use crate::{ProgramIdentifier, Tree};

/// A JavaScript or TypeScript file parsed as one program.
#[derive(Debug)]
pub struct Script {
    pub tree: Tree,
    pub root: ProgramIdentifier,
}

/// The tree of a standalone JavaScript or TypeScript file.
#[derive(Debug)]
pub struct Parsed;

impl Artifact for Parsed {
    type Output = Result<Script, Diagnostic>;

    const NAME: &'static str = "ts.tree";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        // oxc reads TypeScript and declaration files (`.d.ts`) from the extension.
        let source_type =
            SourceType::from_path(Path::new(&context.document.path)).map_err(|error| {
                Diagnostic::error("unknown_extension", error.to_string(), Span::new(0, 0))
            })?;
        // Prettier reads `export` in a `.cjs` file too; only Node decides what a module is.
        let source_type = if source_type.is_commonjs() {
            source_type.with_unambiguous(true)
        } else {
            source_type
        };
        let (tree, root) = Tree::program(context.document, source_type)?;
        Ok(Script { tree, root })
    }
}

pub static PLUGIN: Plugin = Plugin {
    identifier: "typescript.tree",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[],
};

pub fn register(registry: &mut Registry) {
    registry.plugin(&PLUGIN);
    registry.artifact::<Parsed>();
}
