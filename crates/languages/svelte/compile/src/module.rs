//! Upstream `compileModule`: a `.svelte.js` or `.svelte.ts` module, compiled by the component
//! pipeline as a component's module script with nothing else around it.

use oxc_allocator::Allocator;
use oxc_span::SourceType;
use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_kernel::performance::measurement;
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::LineIndex;
use rsvelte_svelte_semantic::compiler_syntax_tree::{Children, CompilerSyntaxTreeBuilder};
use rsvelte_svelte_semantic::input::ComponentInput;
use rsvelte_svelte_semantic::resolve::resolve;
use rsvelte_typescript_compile::print;
use rsvelte_typescript_tree::Tree;

use crate::lower::{self, CompileInput, Target};

/// A module `compileModule` reads; a `.svelte.ts` one is read with its types.
fn matches(document: &Document) -> bool {
    document.path.ends_with(".svelte.js") || document.path.ends_with(".svelte.ts")
}

#[derive(Debug)]
pub struct CompileModule {
    pub target: Target,
}

impl Task for CompileModule {
    fn identifier(&self) -> &'static str {
        match self.target {
            Target::Client => "svelte.compileModule/client",
            Target::Server => "svelte.compileModule/server",
        }
    }

    fn applies(&self, document: &Document) -> bool {
        matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        // A bundler strips a `.svelte.ts` module's types before upstream reads it.
        let source_type = if context.document.path.ends_with(".svelte.ts") {
            SourceType::ts()
        } else {
            SourceType::mjs()
        };
        match compiled(context.document, source_type, self.target, None) {
            Ok(javascript) => out.file("js", javascript.out),
            Err(diagnostic) => out.diagnostics.push(diagnostic),
        }
    }
}

/// One target's module, printed, with its mappings to `document` when `lines` is given.
///
/// # Errors
///
/// The parse error, what upstream rejects, or what this port does not lower yet.
pub(crate) fn compiled(
    document: &Document,
    source_type: SourceType,
    target: Target,
    lines: Option<&LineIndex>,
) -> Result<Emitter, Diagnostic> {
    let (javascript, program) = Tree::program(document, source_type)?;
    let compiler_syntax_tree =
        CompilerSyntaxTreeBuilder::new(&document.text, 0, 0).finish(Children::default());
    let input = CompileInput::from(ComponentInput {
        javascript: &javascript,
        instance: None,
        module: Some(program),
        compiler_syntax_tree: &compiler_syntax_tree,
        style: None,
        filename: &document.path,
        source_text: &document.text,
    });
    let res = resolve(&javascript, None, Some(program), &compiler_syntax_tree);
    let allocator = Allocator::default();
    let module = {
        let _p = measurement::phase(match target {
            Target::Client => "svelte.lower.client",
            Target::Server => "svelte.lower.server",
        });
        lower::lower_module(&input, &res, target, &allocator)?
    };
    let _p = measurement::phase("js.print");
    Ok(lines.map_or_else(
        || Emitter {
            out: print::print(&module),
            mappings: Vec::new(),
        },
        |lines| print::print_mapped(&module, lines),
    ))
}

#[cfg(test)]
mod tests;
